import React, { useState, useRef } from 'react';
import { Plus, X, Upload, ChevronDown, ChevronUp, Package, Edit, Trash2, Save, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';

// Exchange rates to SAR (base currency)
const EXCHANGE_RATES = { USD: 3.75, SAR: 1.00, EUR: 4.05, GBP: 4.73 };
const CURRENCY_OPTIONS = ['USD', 'SAR', 'EUR', 'GBP'];

const formatCurrency = (amount, currency) => {
    if (amount === '' || amount === null || amount === undefined || isNaN(Number(amount))) return '—';
    return `${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

const toSAR = (amount, currency) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return Number(amount) * rate;
};

const POLineItemsForm = ({ poId, projectId }) => {
    const { poLineItems, addPOLineItems, updatePOLineItem, deletePOLineItem, spools, products } = useStore();
    const [showCreate, setShowCreate] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const fileInputRef = useRef(null);

    const initialFormState = {
        poId,
        projectId,
        poLineItemNumber: '',
        itemCategory: products.length > 0 ? products[0].name : '',
        customerMaterialNumber: '',
        description: '',
        size: '',
        wt: '',
        quantity: 1,
        pipeLength: 12,
        uom: 'EA',
        unitPrice: '',
        currency: 'USD',
        vatPercent: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        // engineering vars (keep existing)
        drawingNo: '',
        drawingRev: '',
        materialGrade: '',
        craMaterial: 'INC 625',
        overlayThickness: '',
        hydrotestPressure: '',
        paintingSpec: '',
        wpsNumber: '',
        refItpNumber: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // ── Derived pricing calculations ──────────────────────────────────────────
    const calcNetTotal = (qty, unitPrice) => {
        const q = Number(qty);
        const u = Number(unitPrice);
        if (!qty || !unitPrice || isNaN(q) || isNaN(u)) return '';
        return (q * u).toFixed(2);
    };

    const netTotal = calcNetTotal(formData.quantity, formData.unitPrice);

    const hasVat = formData.vatPercent !== '' && !isNaN(Number(formData.vatPercent)) && Number(formData.vatPercent) > 0;
    const vatAmount = hasVat && netTotal !== '' ? (Number(netTotal) * Number(formData.vatPercent) / 100).toFixed(2) : '';
    const grandTotal = hasVat && netTotal !== '' ? (Number(netTotal) + Number(vatAmount)).toFixed(2) : '';

    // Base-currency conversion uses Grand Total (incl. VAT) if VAT exists, otherwise Net Total
    const priceForBase = grandTotal !== '' ? grandTotal : netTotal;
    const basePriceSAR = priceForBase !== '' ? toSAR(Number(priceForBase), formData.currency).toFixed(2) : '';

    // ─────────────────────────────────────────────────────────────────────────

    const currentLineItems = poLineItems.filter(item => item.poId === poId);

    const handleCreateOrUpdateManual = (e) => {
        e.preventDefault();
        const enriched = {
            ...formData,
            netTotal,
            vatAmount,
            grandTotal,
            basePriceSAR,
        };
        if (editingItem) {
            updatePOLineItem(editingItem.id, enriched);
        } else {
            addPOLineItems([enriched]);
        }
        setShowCreate(false);
        setEditingItem(null);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this Line Item? This will also remove any associated spools.")) {
            deletePOLineItem(id);
            if (expandedRow === id) setExpandedRow(null);
        }
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({ ...initialFormState, ...item });
        setShowCreate(true);
        setExpandedRow(null);
    };

    const cancelEdit = () => {
        setShowCreate(false);
        setEditingItem(null);
        resetForm();
    };

    const resetForm = () => setFormData(initialFormState);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws);
            const importedItems = data.map(row => ({
                poId, projectId,
                poLineItemNumber: row['Line Item No'] || row['Item No'] || '',
                itemCategory: row['Item Category'] || (products.length > 0 ? products[0].name : 'Cladded Pipe'),
                customerMaterialNumber: row['Material No'] || '',
                description: row['Description'] || '',
                size: row['Size'] || '',
                wt: row['Wall Thickness'] || '',
                quantity: row['Quantity'] || 1,
                pipeLength: row['Pipe Length'] || 0,
                uom: row['UOM'] || 'EA',
                unitPrice: row['Unit Price'] || '',
                currency: row['Currency'] || 'USD',
                vatPercent: row['VAT %'] || '',
                deliveryDate: row['Delivery Date'] || new Date().toISOString().split('T')[0],
                drawingNo: row['Drawing Number'] || '',
                drawingRev: row['Drawing Rev'] || '',
                materialGrade: row['Material Grade'] || '',
                craMaterial: row['CRA Material'] || 'INC 625',
                overlayThickness: row['Overlay Thickness'] || '',
                hydrotestPressure: row['Hydrotest Pressure'] || '',
                paintingSpec: row['Painting Specification'] || '',
                wpsNumber: row['WPS Number'] || '',
                refItpNumber: row['Reference ITP Number'] || ''
            }));
            addPOLineItems(importedItems);
            e.target.value = null;
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h4>PO Line Items</h4>
                {!showCreate && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="file" accept=".xlsx, .xls, .csv"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>
                            <Upload size={18} /> Bulk Upload (Excel)
                        </button>
                        <button className="btn-primary" onClick={() => setShowCreate(true)}>
                            <Plus size={18} /> Add Manual
                        </button>
                    </div>
                )}
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            {!showCreate ? (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Line No</th>
                                <th>Material No</th>
                                <th>Description</th>
                                <th>Size / WT</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Net Total</th>
                                <th>VAT %</th>
                                <th>Grand Total</th>
                                <th>Base (SAR)</th>
                                <th>Delivery</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLineItems.map(item => {
                                const generatedSpoolsCount = spools.filter(s => s.lineItemId === item.id).length;
                                const isExpanded = expandedRow === item.id;
                                const cur = item.currency || 'USD';
                                // Recalculate derived values for display (handles items created before this update)
                                const dispNet = item.netTotal || (item.quantity && item.unitPrice ? (Number(item.quantity) * Number(item.unitPrice)).toFixed(2) : '');
                                const itemHasVat = item.vatPercent !== '' && item.vatPercent !== undefined && item.vatPercent !== null && Number(item.vatPercent) > 0;
                                const dispVatAmt = itemHasVat && dispNet !== '' ? (Number(dispNet) * Number(item.vatPercent) / 100).toFixed(2) : '';
                                const dispGrand = item.grandTotal || (itemHasVat && dispNet !== '' ? (Number(dispNet) + Number(dispVatAmt)).toFixed(2) : '');
                                const baseSource = dispGrand !== '' ? dispGrand : dispNet;
                                const dispBase = item.basePriceSAR || (baseSource !== '' ? toSAR(Number(baseSource), cur).toFixed(2) : '');
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedRow(isExpanded ? null : item.id)}>
                                            <td>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                                            <td className="highlight-text">{item.poLineItemNumber}</td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.customerMaterialNumber || '—'}</td>
                                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</td>
                                            <td style={{ fontSize: '0.83rem' }}>
                                                {item.size ? <span>{item.size}</span> : '—'}
                                                {item.wt ? <span className="text-muted"> / {item.wt}</span> : ''}
                                            </td>
                                            <td>{item.quantity} {item.uom}</td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {item.unitPrice
                                                    ? <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{formatCurrency(item.unitPrice, cur)}</span>
                                                    : <span className="text-muted">—</span>
                                                }
                                            </td>
                                            {/* Net Total */}
                                            <td style={{ fontWeight: 500 }}>
                                                {dispNet ? <span>{formatCurrency(dispNet, cur)}</span> : <span className="text-muted">—</span>}
                                            </td>
                                            {/* VAT % */}
                                            <td>
                                                {itemHasVat
                                                    ? <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{item.vatPercent}%</span>
                                                    : <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                                }
                                            </td>
                                            {/* Grand Total (only coloured prominently when VAT > 0) */}
                                            <td style={{ fontWeight: 600 }}>
                                                {itemHasVat && dispGrand
                                                    ? <span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(dispGrand, cur)}</span>
                                                    : dispNet
                                                        ? <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.82rem' }}>{formatCurrency(dispNet, cur)}</span>
                                                        : <span className="text-muted">—</span>
                                                }
                                            </td>
                                            {/* Base SAR */}
                                            <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                                                {dispBase ? formatCurrency(dispBase, 'SAR') : <span className="text-muted">—</span>}
                                            </td>
                                            <td>{item.deliveryDate}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button className="icon-btn-small" onClick={() => openEdit(item)} title="Edit" style={{ color: 'var(--text-secondary)' }}><Edit size={16} /></button>
                                                    <button className="icon-btn-small" onClick={() => handleDelete(item.id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                                <td colSpan="14" style={{ padding: '1.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Engineering Specifications</h5>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Category:</strong> {item.itemCategory}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Drawing:</strong> {item.drawingNo} (Rev {item.drawingRev})</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Grade:</strong> {item.materialGrade}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>CRA Mat:</strong> {item.craMaterial}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Overlay:</strong> {item.overlayThickness}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Hydrotest:</strong> {item.hydrotestPressure}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Painting:</strong> {item.paintingSpec}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>WPS No:</strong> {item.wpsNumber}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>ITP Ref:</strong> {item.refItpNumber}</div>
                                                                {item.itemCategory?.includes('Pipe') && (
                                                                    <div><strong style={{ color: 'var(--text-muted)' }}>Pipe Length:</strong> {item.pipeLength} m</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                                                <Package size={16} /> Spools: {generatedSpoolsCount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {currentLineItems.length === 0 && (
                                <tr>
                                    <td colSpan="14" className="text-center py-4 text-muted">No Line Items recorded. Upload Excel or Add Manually.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* ── Create / Edit Form ────────────────────────────────────── */
                <div className="glass-panel create-form-panel animate-fade-in" style={{ maxWidth: '100%', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="form-header">
                        <h3>{editingItem ? `Edit Line Item: ${editingItem.poLineItemNumber}` : 'Add Line Item Manually'}</h3>
                        <button className="icon-btn-small" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    {editingItem && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <strong>Note:</strong> Modifying Quantity or Pipe Length will not automatically regenerate previously created tracking Spools.
                        </div>
                    )}
                    <form onSubmit={handleCreateOrUpdateManual} className="so-form">

                        {/* ── Section 1: Basic Information ────────────────────── */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>Basic Information</h5>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Product / Category</label>
                                <select className="premium-input select-input" value={formData.itemCategory} onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })} required>
                                    {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Line Item No</label>
                                <input type="text" className="premium-input" placeholder="e.g. 10 or 0010" value={formData.poLineItemNumber} onChange={(e) => setFormData({ ...formData, poLineItemNumber: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Material No</label>
                                <input type="text" className="premium-input" value={formData.customerMaterialNumber} onChange={(e) => setFormData({ ...formData, customerMaterialNumber: e.target.value })} />
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Line Item Description</label>
                                <textarea className="premium-input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Size</label>
                                <input type="number" step="any" className="premium-input" placeholder='e.g. 6"' value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Wall Thickness (WT)</label>
                                <input type="number" step="any" className="premium-input" placeholder='e.g. 9.53' value={formData.wt} onChange={(e) => setFormData({ ...formData, wt: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Quantity</label>
                                <input type="number" className="premium-input" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required min="1" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Unit of Measure (UOM)</label>
                                <select className="premium-input select-input" value={formData.uom} onChange={(e) => setFormData({ ...formData, uom: e.target.value })} required>
                                    <option value="EA">EA</option>
                                    <option value="m">m</option>
                                    <option value="ft">ft</option>
                                    <option value="kg">kg</option>
                                </select>
                            </div>
                            {formData.itemCategory?.includes('Pipe') && (
                                <div className="input-group">
                                    <label className="input-label">Pipe Length (m) <span style={{ color: 'var(--accent-primary)' }}>— for Spool Calc</span></label>
                                    <input type="number" className="premium-input" value={formData.pipeLength} onChange={(e) => setFormData({ ...formData, pipeLength: e.target.value })} required />
                                </div>
                            )}
                            <div className="input-group">
                                <label className="input-label">Delivery Date</label>
                                <input type="date" className="premium-input" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} required />
                            </div>
                        </div>

                        {/* ── Section 2: Pricing ──────────────────────────────── */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '1.5rem 0 1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                            <DollarSign size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                            Pricing
                        </h5>
                        <div className="form-grid">
                            {/* Unit Price + Currency */}
                            <div className="input-group">
                                <label className="input-label">Unit Price</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        className="premium-input select-input"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        style={{ width: '90px', flexShrink: 0 }}
                                    >
                                        {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input
                                        type="number" step="0.01" min="0"
                                        className="premium-input"
                                        placeholder="0.00"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* VAT % */}
                            <div className="input-group">
                                <label className="input-label">VAT % <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span></label>
                                <input
                                    type="number" step="0.01" min="0" max="100"
                                    className="premium-input"
                                    placeholder="e.g. 15"
                                    value={formData.vatPercent}
                                    onChange={(e) => setFormData({ ...formData, vatPercent: e.target.value })}
                                />
                            </div>

                            {/* Net Total Price (Qty × Unit Price, no VAT) */}
                            <div className="input-group">
                                <label className="input-label">Net Total Price <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(Qty × Unit Price)</span></label>
                                <input
                                    type="text" className="premium-input"
                                    style={{ color: 'var(--accent-primary)', fontWeight: 600, backgroundColor: 'var(--bg-primary)' }}
                                    value={netTotal !== '' ? `${netTotal} ${formData.currency}` : '—'}
                                    disabled
                                />
                            </div>

                            {/* Grand Total Price — only shown when VAT > 0 */}
                            {hasVat && (
                                <div className="input-group">
                                    <label className="input-label">
                                        Grand Total Price
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem', marginLeft: '0.4rem' }}>
                                            (incl. {formData.vatPercent}% VAT = +{vatAmount} {formData.currency})
                                        </span>
                                    </label>
                                    <input
                                        type="text" className="premium-input"
                                        style={{ color: '#f59e0b', fontWeight: 700, backgroundColor: 'var(--bg-primary)', fontSize: '1rem' }}
                                        value={grandTotal !== '' ? `${grandTotal} ${formData.currency}` : '—'}
                                        disabled
                                    />
                                </div>
                            )}

                            {/* Total Base Price in SAR — converts Grand Total if VAT exists, otherwise Net Total */}
                            <div className="input-group">
                                <label className="input-label">
                                    Total Base Price (SAR)
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.4rem' }}>
                                        {formData.currency !== 'SAR' ? `(1 ${formData.currency} = ${EXCHANGE_RATES[formData.currency] || '?'} SAR${hasVat ? ', from Grand Total' : ''})` : hasVat ? '(from Grand Total)' : ''}
                                    </span>
                                </label>
                                <input
                                    type="text" className="premium-input"
                                    style={{ color: 'var(--accent-secondary, #34d399)', fontWeight: 600, backgroundColor: 'var(--bg-primary)' }}
                                    value={basePriceSAR !== '' ? `${basePriceSAR} SAR` : '—'}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* ── Section 3: Engineering Variables ────────────────── */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '1.5rem 0 1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>Engineering Variables</h5>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Drawing Number</label>
                                <input type="text" className="premium-input" value={formData.drawingNo} onChange={(e) => setFormData({ ...formData, drawingNo: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Drawing Revision</label>
                                <input type="text" className="premium-input" value={formData.drawingRev} onChange={(e) => setFormData({ ...formData, drawingRev: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Material Grade</label>
                                <input type="text" className="premium-input" value={formData.materialGrade} onChange={(e) => setFormData({ ...formData, materialGrade: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">CRA Material</label>
                                <input type="text" className="premium-input" value={formData.craMaterial} onChange={(e) => setFormData({ ...formData, craMaterial: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Overlay Thck &amp; Allowance</label>
                                <input type="text" className="premium-input" value={formData.overlayThickness} onChange={(e) => setFormData({ ...formData, overlayThickness: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Hydrotest Pressure (PSIG)</label>
                                <input type="text" className="premium-input" value={formData.hydrotestPressure} onChange={(e) => setFormData({ ...formData, hydrotestPressure: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Painting Specification</label>
                                <input type="text" className="premium-input" value={formData.paintingSpec} onChange={(e) => setFormData({ ...formData, paintingSpec: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">WPS Number</label>
                                <input type="text" className="premium-input" value={formData.wpsNumber} onChange={(e) => setFormData({ ...formData, wpsNumber: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Reference ITP Number</label>
                                <input type="text" className="premium-input" value={formData.refItpNumber} onChange={(e) => setFormData({ ...formData, refItpNumber: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                            <button type="submit" className="btn-primary"><Save size={18} /> {editingItem ? 'Update Line Item' : 'Process Item & Generate Spools'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default POLineItemsForm;
