import { useEffect, useRef } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { STORE_DATA_KEYS, useStore } from '../store/useStore';

const APP_STATE_ROW_ID = 'global';
const SAVE_DEBOUNCE_MS = 1000;

const pickStoreData = (state) => {
    const snapshot = {};
    STORE_DATA_KEYS.forEach((key) => {
        snapshot[key] = state[key];
    });
    return snapshot;
};

const CloudSyncProvider = ({ children }) => {
    const isReadyRef = useRef(false);
    const saveTimerRef = useRef(null);
    const lastSavedSnapshotRef = useRef('');

    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) {
            return;
        }

        const loadFromCloud = async () => {
            const { data, error } = await supabase
                .from('app_state')
                .select('payload')
                .eq('id', APP_STATE_ROW_ID)
                .maybeSingle();

            if (error) {
                console.error('Failed to load cloud state:', error.message);
                isReadyRef.current = true;
                return;
            }

            if (data?.payload && typeof data.payload === 'object') {
                useStore.setState(data.payload);
                lastSavedSnapshotRef.current = JSON.stringify(data.payload);
            } else {
                const currentSnapshot = pickStoreData(useStore.getState());
                lastSavedSnapshotRef.current = JSON.stringify(currentSnapshot);
            }

            isReadyRef.current = true;
        };

        loadFromCloud();

        const unsubscribe = useStore.subscribe((state) => {
            if (!isReadyRef.current) return;
            const snapshot = pickStoreData(state);
            const encoded = JSON.stringify(snapshot);
            if (encoded === lastSavedSnapshotRef.current) return;

            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(async () => {
                const { error } = await supabase
                    .from('app_state')
                    .upsert(
                        {
                            id: APP_STATE_ROW_ID,
                            payload: snapshot,
                            updated_at: new Date().toISOString()
                        },
                        { onConflict: 'id' }
                    );

                if (error) {
                    console.error('Failed to save cloud state:', error.message);
                    return;
                }

                lastSavedSnapshotRef.current = encoded;
            }, SAVE_DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    return children;
};

export default CloudSyncProvider;
