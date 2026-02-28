import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const STORE_DATA_KEYS = [
    'projects',
    'purchaseOrders',
    'poLineItems',
    'spools',
    'assemblyJoints',
    'jisOperations',
    'nmrDocuments',
    'mtos',
    'selectedProjectId',
    'selectedPOId',
    'customers',
    'vendors',
    'products',
    'workstations',
    'projectCounter',
    'poLineItemCounter'
];

export const useStore = create(
    persist(
        (set, get) => ({
            // Tables
            projects: [],
            purchaseOrders: [],
            poLineItems: [],
            spools: [],
            assemblyJoints: [],
            jisOperations: [],
            nmrDocuments: [],
            mtos: [],

            // Selections for Cross-Page Navigation
            selectedProjectId: null,
            selectedPOId: null,

            // Master Data
            customers: [
                { id: 'CUST-001', name: 'PetroChem Global', industry: 'Oil & Gas', country: 'UAE', phone: '+971 50 123 4567', email: 'contact@petrochem.com' },
                { id: 'CUST-002', name: 'Aramco', industry: 'Energy', country: 'KSA', phone: '+966 50 123 4567', email: 'procurement@aramco.com' }
            ],
            vendors: [],
            products: [
                { id: 'PROD-001', code: 'PIPE-INC625', name: 'Inconel 625 Cladded Pipe', category: 'Semi-Finished', uom: 'm' },
                { id: 'PROD-002', code: 'WIRE-625', name: 'Inconel 625 Welding Wire', category: 'Consumable', uom: 'kg' }
            ],
            workstations: [
                { id: 'WS-01', name: 'Cladding Station A', type: 'Weld Overlay', status: 'Active' },
                { id: 'WS-02', name: 'Cladding Station B', type: 'Weld Overlay', status: 'Maintenance' },
                { id: 'WS-03', name: 'Inspection Area 1', type: 'Quality', status: 'Active' }
            ],

            // Auto-incrementers
            projectCounter: 1,
            poLineItemCounter: 1,

            // ==========================================
            // PROJECTS
            // ==========================================
            addProject: (projectData) => set((state) => {
                const id = `AS-CL-${String(state.projectCounter).padStart(3, '0')}`;
                // Client Name = Customer / End User per requirements
                const clientName = `${projectData.customer} / ${projectData.endUser}`;

                return {
                    projects: [...state.projects, { ...projectData, id, clientName }],
                    projectCounter: state.projectCounter + 1
                };
            }),
            updateProject: (id, updates) => set((state) => {
                const clientName = updates.customer && updates.endUser ? `${updates.customer} / ${updates.endUser}` : undefined;
                return {
                    projects: state.projects.map(p => p.id === id ? { ...p, ...updates, ...(clientName && { clientName }) } : p)
                };
            }),
            deleteProject: (id) => set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                purchaseOrders: state.purchaseOrders.filter(po => po.projectId !== id),
                poLineItems: state.poLineItems.filter(li => li.projectId !== id),
                spools: state.spools.filter(s => s.projectId !== id),
                mtos: state.mtos.filter(m => m.projectId !== id)
            })),

            // ==========================================
            // PURCHASE ORDERS
            // ==========================================
            addPurchaseOrder: (poData) => set((state) => ({
                purchaseOrders: [...state.purchaseOrders, { ...poData, id: `PO-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),
            updatePurchaseOrder: (id, updates) => set((state) => ({
                purchaseOrders: state.purchaseOrders.map(po => po.id === id ? { ...po, ...updates } : po)
            })),
            deletePurchaseOrder: (id) => set((state) => ({
                purchaseOrders: state.purchaseOrders.filter(po => po.id !== id),
                poLineItems: state.poLineItems.filter(li => li.poId !== id),
                spools: state.spools.filter(s => s.poId !== id),
                mtos: state.mtos.filter(m => m.purchaseOrderId !== id)
            })),

            // ==========================================
            // LINE ITEMS & AUTO SPOOL GENERATION
            // ==========================================
            addPOLineItems: (items) => set((state) => {
                const newLineItems = [];
                const newSpools = [];
                let currentLineItemCounter = state.poLineItemCounter;

                items.forEach((item, index) => {
                    const lineItemId = `LI-${String(currentLineItemCounter).padStart(4, '0')}`;
                    newLineItems.push({ ...item, id: lineItemId, poLineItemNumber: currentLineItemCounter });

                    // Parent associations
                    const project = state.projects.find(p => p.id === item.projectId);
                    // Format SP-AAA-B001 (AAA = last 3 of Project, B = Line item No)
                    const projectCode = project ? project.id.split('-').pop() : '000';
                    const bCode = currentLineItemCounter;

                    let spoolCount = 0;
                    if (item.itemCategory.includes('Pipe')) {
                        // For every 12 meters of pipe length, 1 spool is created.
                        spoolCount = Math.ceil((Number(item.pipeLength) || 0) / 12);
                    } else {
                        // 1 spool per quantity for Flange, Fitting, Spool, etc.
                        spoolCount = Number(item.quantity) || 1;
                    }

                    // Generate the individual Spool tracking items
                    for (let i = 1; i <= spoolCount; i++) {
                        newSpools.push({
                            id: `SP-${projectCode}-${bCode}${String(i).padStart(3, '0')}`,
                            lineItemId: lineItemId,
                            projectId: item.projectId,
                            poId: item.poId,
                            itemCategory: item.itemCategory,
                            description: item.description,
                            qtyLength: item.itemCategory.includes('Pipe') ? 12 : 1, // Approximated
                            barcode: `BC-SP-${projectCode}-${bCode}${String(i).padStart(3, '0')}`,
                            sageCode: '', // Generated later during Cladding Part
                            heatNumber: '',
                            cuttingSheetNumber: '',
                            mtrNumber: '',
                            minNumber: '',
                            status: 'Pending Cladding'
                        });
                    }
                    currentLineItemCounter++;
                });

                return {
                    poLineItems: [...state.poLineItems, ...newLineItems],
                    spools: [...state.spools, ...newSpools],
                    poLineItemCounter: currentLineItemCounter
                };
            }),
            updatePOLineItem: (id, updates) => set((state) => ({
                poLineItems: state.poLineItems.map(li => li.id === id ? { ...li, ...updates } : li)
            })),
            deletePOLineItem: (id) => set((state) => ({
                poLineItems: state.poLineItems.filter(li => li.id !== id),
                spools: state.spools.filter(s => s.lineItemId !== id)
            })),

            // ==========================================
            // SPOOLS & CLADDING (SAGE CODES)
            // ==========================================
            updateSpool: (id, updates) => set((state) => ({
                spools: state.spools.map(s => s.id === id ? { ...s, ...updates } : s)
            })),
            deleteSpool: (id) => set((state) => ({
                spools: state.spools.filter(s => s.id !== id)
            })),

            generateSageCodeForSpool: (spoolId) => set((state) => {
                // Once cladding is done on a loose item, it gets a Sage Code so it can be picked for Assembly.
                const sageCode = `SAGE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                return {
                    spools: state.spools.map(s => s.id === spoolId ? { ...s, sageCode, status: 'Cladded - Ready for Assembly' } : s)
                };
            }),

            // ==========================================
            // ASSEMBLY JOINTS
            // ==========================================
            addAssemblyJoint: (jointData) => set((state) => ({
                // jointData expects component1 and component2 to be Sage Codes
                assemblyJoints: [...state.assemblyJoints, { ...jointData, id: `AJ-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),
            updateAssemblyJoint: (id, updates) => set((state) => ({
                assemblyJoints: state.assemblyJoints.map(aj => aj.id === id ? { ...aj, ...updates } : aj)
            })),
            deleteAssemblyJoint: (id) => set((state) => ({
                assemblyJoints: state.assemblyJoints.filter(aj => aj.id !== id)
            })),

            // ==========================================
            // JOB INSTRUCTION SHEETS (JIS)
            // ==========================================
            addJisOperation: (jisData) => set((state) => ({
                jisOperations: [...state.jisOperations, { ...jisData, id: `JIS-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),

            updateJisOperation: (id, updates) => set((state) => ({
                jisOperations: state.jisOperations.map(j => j.id === id ? { ...j, ...updates } : j)
            })),
            deleteJisOperation: (id) => set((state) => ({
                jisOperations: state.jisOperations.filter(j => j.id !== id)
            })),

            // ==========================================
            // MASTER DATA
            // ==========================================
            addCustomer: (data) => set((state) => ({
                customers: [...state.customers, { ...data, id: `CUST-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),
            updateCustomer: (id, updates) => set((state) => ({
                customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
            })),
            deleteCustomer: (id) => set((state) => ({
                customers: state.customers.filter(c => c.id !== id)
            })),

            addVendor: (data) => set((state) => ({
                vendors: [...state.vendors, { ...data, id: `VEND-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),
            updateVendor: (id, updates) => set((state) => ({
                vendors: state.vendors.map(v => v.id === id ? { ...v, ...updates } : v)
            })),
            deleteVendor: (id) => set((state) => ({
                vendors: state.vendors.filter(v => v.id !== id)
            })),

            addProduct: (data) => set((state) => ({
                products: [...state.products, { ...data, id: `PROD-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),
            updateProduct: (id, updates) => set((state) => ({
                products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
            })),
            deleteProduct: (id) => set((state) => ({
                products: state.products.filter(p => p.id !== id)
            })),

            addWorkstation: (data) => set((state) => ({
                workstations: [...state.workstations, { ...data, id: `WS-${Math.random().toString(36).substr(2, 4).toUpperCase()}` }]
            })),
            updateWorkstation: (id, updates) => set((state) => ({
                workstations: state.workstations.map(w => w.id === id ? { ...w, ...updates } : w)
            })),
            deleteWorkstation: (id) => set((state) => ({
                workstations: state.workstations.filter(w => w.id !== id)
            })),

            // ==========================================
            // NMR DOCUMENTS
            // ==========================================
            addNmrDocument: (data) => set((state) => {
                const newDoc = {
                    ...data,
                    id: `NMR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    // drawingNumber is provided in data
                    // lineItemIds (array) is provided in data
                    revision: 'A',          // Always start at Rev A
                    status: 'DRAFT',
                    lastCode: null,         // Last client response code
                    revisionHistory: [],    // { rev, submissionDate, returnDate, code, comment }
                    createdAt: new Date().toISOString(),
                };
                return {
                    nmrDocuments: [...state.nmrDocuments, newDoc],
                };
            }),

            updateNmrDocument: (id, updates) => set((state) => ({
                nmrDocuments: state.nmrDocuments.map(n => n.id === id ? { ...n, ...updates } : n)
            })),

            deleteNmrDocument: (id) => set((state) => ({
                nmrDocuments: state.nmrDocuments.filter(n => n.id !== id),
                mtos: state.mtos.filter(m => m.nmrDocumentId !== id)
            })),

            // Submit current revision for client review (records submissionDate)
            submitNmrForReview: (id, submissionDate) => set((state) => ({
                nmrDocuments: state.nmrDocuments.map(n => {
                    if (n.id !== id) return n;
                    // Add a history entry for this revision's submission
                    const existingEntry = n.revisionHistory.find(r => r.rev === n.revision);
                    const updatedHistory = existingEntry
                        ? n.revisionHistory.map(r => r.rev === n.revision ? { ...r, submissionDate: submissionDate || new Date().toISOString().split('T')[0] } : r)
                        : [...n.revisionHistory, { rev: n.revision, submissionDate: submissionDate || new Date().toISOString().split('T')[0], returnDate: null, code: null, comment: '' }];
                    return { ...n, status: 'SUBMITTED', revisionHistory: updatedHistory };
                })
            })),

            // Record client response with code (1, 2, 3, 4, D) + returnDate + comment
            // Code 1: Approved (but need formal Rev 0 unless already Rev 0)
            // Code 2: Revise & Resubmit — Work MAY proceed
            // Code 3: Revise & Resubmit — Work may NOT proceed  
            // Code 4: Review Not Required — Work may proceed
            // Code D: For Information Only
            recordNmrClientResponse: (id, { code, returnDate, comment }) => set((state) => ({
                nmrDocuments: state.nmrDocuments.map(n => {
                    if (n.id !== id) return n;
                    const retDate = returnDate || new Date().toISOString().split('T')[0];
                    // Update the history entry for current revision
                    const updatedHistory = n.revisionHistory.map(r =>
                        r.rev === n.revision ? { ...r, returnDate: retDate, code, comment: comment || '' } : r
                    );
                    if (code === '1') {
                        if (n.revision === '0') {
                            // Rev 0 gets Code 1 = FULLY APPROVED
                            return { ...n, status: 'APPROVED', lastCode: '1', revisionHistory: updatedHistory };
                        }
                        // Alpha revision gets Code 1 → need to submit formal Rev 0
                        return { ...n, status: 'PENDING-REV0', lastCode: '1', revisionHistory: updatedHistory };
                    }
                    if (code === '2' || code === '3') {
                        // Revise: bump revision letter A→B→C...
                        const nextRev = String.fromCharCode(n.revision.charCodeAt(0) + 1);
                        return { ...n, status: code === '2' ? 'CODE-2' : 'CODE-3', lastCode: code, revision: nextRev, revisionHistory: updatedHistory };
                    }
                    if (code === '4') return { ...n, status: 'CODE-4', lastCode: '4', revisionHistory: updatedHistory };
                    if (code === 'D') return { ...n, status: 'CODE-D', lastCode: 'D', revisionHistory: updatedHistory };
                    return n;
                })
            })),

            // After Code 1 on alpha revision — formally submit Rev 0
            submitNmrRev0: (id, submissionDate) => set((state) => ({
                nmrDocuments: state.nmrDocuments.map(n => {
                    if (n.id !== id) return n;
                    const rev0Entry = { rev: '0', submissionDate: submissionDate || new Date().toISOString().split('T')[0], returnDate: null, code: null, comment: '' };
                    return {
                        ...n,
                        revision: '0',
                        status: 'SUBMITTED',
                        revisionHistory: [...n.revisionHistory, rev0Entry]
                    };
                })
            })),

            // ==========================================
            // MATERIAL TAKE-OFFS (MTOs)
            // ==========================================
            addMTO: (mtoData) => set((state) => ({
                mtos: [...state.mtos, { ...mtoData, id: `MTO-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }]
            })),

            updateMTO: (id, updates) => set((state) => ({
                mtos: state.mtos.map(m => m.id === id ? { ...m, ...updates } : m)
            })),

            deleteMTO: (id) => set((state) => ({
                mtos: state.mtos.filter(m => m.id !== id)
            })),


            // After Code 2/3 — create a new revision draft (already bumped in recordNmrClientResponse)
            resetNmrToDraft: (id) => set((state) => ({
                nmrDocuments: state.nmrDocuments.map(n =>
                    n.id === id ? { ...n, status: 'DRAFT' } : n
                )
            })),

            // Selection Actions
            setSelectedProjectId: (id) => set({ selectedProjectId: id }),
            setSelectedPOId: (id) => set({ selectedPOId: id }),

            // ==========================================
            // UTILS
            // ==========================================
            clearStore: () => set({
                projects: [], purchaseOrders: [], poLineItems: [], spools: [], assemblyJoints: [], jisOperations: [], nmrDocuments: [], mtos: [], projectCounter: 1, poLineItemCounter: 1
            })
        }),
        {
            name: 'aasia-clad-pro-v2',
        }
    )
);
