import React, { useState, useRef } from 'react';
import { Plus, X, Upload, CheckCircle2, ChevronDown, ChevronUp, Package, Edit, Trash2, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';

const POLineItemsForm = ({ poId, projectId }) => {
    const { poLineItems, addPOLineItems, updatePOLineItem, deletePOLineItem, spools } = useStore();
    const [showCreate, setShowCreate] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const fileInputRef = useRef(null);

    const initialFormState = {
        poId,
        projectId,
        itemCategory: 'Cladded Pipe',
        customerMaterialNumber: '',
        description: '',
        quantity: 1,
        pipeLength: 12,
        uom: 'EA',
        deliveryDate: new Date().toISOString().split('T')[0],
        drawingNo: '',
        drawingRev: '',
        size: '',
        wt: '', // Wall Thickness
        materialGrade: '',
        craMaterial: 'INC 625',
        overlayThickness: '',
        hydrotestPressure: '',
        paintingSpec: '',
        wpsNumber: '',
        refItpNumber: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const categories = ['Cladded Pipe', 'Flange', 'Fitting', 'Spectacle Plate', 'Barred Tee', 'Cladded Spool'];

    const currentLineItems = poLineItems.filter(item => item.poId === poId);

    const handleCreateOrUpdateManual = (e) => {
        e.preventDefault();
        if (editingItem) {
            updatePOLineItem(editingItem.id, formData);
        } else {
            addPOLineItems([{ ...formData }]);
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
        setFormData({
            ...item
        });
        setShowCreate(true);
        setExpandedRow(null);
    };

    const cancelEdit = () => {
        setShowCreate(false);
        setEditingItem(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData(initialFormState);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const importedItems = data.map(row => ({
                poId,
                projectId,
                itemCategory: row['Item Category'] || 'Cladded Pipe',
                customerMaterialNumber: row['Customer Material Number'] || '',
                description: row['Description'] || '',
                quantity: row['Quantity'] || 1,
                pipeLength: row['Pipe Length'] || 0,
                uom: row['UOM'] || 'EA',
                deliveryDate: row['Delivery Date'] || new Date().toISOString().split('T')[0],
                drawingNo: row['Drawing Number'] || '',
                drawingRev: row['Drawing Rev'] || '',
                size: row['Size'] || '',
                wt: row['Wall Thickness'] || '',
                materialGrade: row['Material Grade'] || '',
                craMaterial: row['CRA Material'] || 'INC 625',
                overlayThickness: row['Overlay Thickness & Allowance'] || '',
                hydrotestPressure: row['Hydrotest Pressure'] || '',
                paintingSpec: row['Painting Specification'] || '',
                wpsNumber: row['WPS Number'] || '',
                refItpNumber: row['Reference ITP Number'] || ''
            }));

            addPOLineItems(importedItems);
            e.target.value = null; // reset input
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
                            type="file"
                            accept=".xlsx, .xls, .csv"
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

            {!showCreate ? (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Line No</th>
                                <th>Category</th>
                                <th>Material No</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Pipe Length</th>
                                <th>Delivery</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLineItems.map(item => {
                                const generatedSpoolsCount = spools.filter(s => s.lineItemId === item.id).length;
                                const isExpanded = expandedRow === item.id;
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedRow(isExpanded ? null : item.id)}>
                                            <td>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                                            <td className="highlight-text">{item.poLineItemNumber}</td>
                                            <td><span className="badge badge-info">{item.itemCategory}</span></td>
                                            <td>{item.customerMaterialNumber}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.description}
                                            </td>
                                            <td>{item.quantity} {item.uom}</td>
                                            <td>{item.itemCategory === 'Cladded Pipe' ? `${item.pipeLength} m` : 'N/A'}</td>
                                            <td>{item.deliveryDate}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button className="icon-btn-small" onClick={() => openEdit(item)} title="Edit Line Item" style={{ color: 'var(--text-secondary)' }}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn-small" onClick={() => handleDelete(item.id)} title="Delete Line Item" style={{ color: 'var(--danger)' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                                <td colSpan="9" style={{ padding: '1.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Engineering Specifications</h5>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Size:</strong> {item.size}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>WT:</strong> {item.wt}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Drawing:</strong> {item.drawingNo} (Rev {item.drawingRev})</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Grade:</strong> {item.materialGrade}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>CRA Mat:</strong> {item.craMaterial}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Overlay:</strong> {item.overlayThickness}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Hydrotest:</strong> {item.hydrotestPressure}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>Painting:</strong> {item.paintingSpec}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>WPS No:</strong> {item.wpsNumber}</div>
                                                                <div><strong style={{ color: 'var(--text-muted)' }}>ITP Ref:</strong> {item.refItpNumber}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                                                <Package size={16} /> Auto-Generated Spools: {generatedSpoolsCount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                            {currentLineItems.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-muted">No Line Items recorded. Upload Excel or Add Manually.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ maxWidth: '100%', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="form-header">
                        <h3>{editingItem ? `Edit Line Item: ${editingItem.poLineItemNumber}` : 'Add Line Item Manually'}</h3>
                        <button className="icon-btn-small" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    {editingItem && (
                        <div className="alert-info" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <strong>Note:</strong> Modifying the Quantity or Pipe Length of an existing Line Item will not automatically regenerate or remove previously auto-generated tracking Spools.
                        </div>
                    )}
                    <form onSubmit={handleCreateOrUpdateManual} className="so-form">
                        <h5 style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>Basic Information</h5>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Item Category</label>
                                <select className="premium-input select-input" value={formData.itemCategory} onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })} required>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Customer Material Number</label>
                                <input type="text" className="premium-input" value={formData.customerMaterialNumber} onChange={(e) => setFormData({ ...formData, customerMaterialNumber: e.target.value })} />
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Description (Rich Text Supported)</label>
                                <textarea className="premium-input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
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
                                </select>
                            </div>
                            {formData.itemCategory === 'Cladded Pipe' && (
                                <div className="input-group">
                                    <label className="input-label">Pipe Length (m) <span style={{ color: 'var(--accent-primary)' }}>- Required for Spool Calc</span></label>
                                    <input type="number" className="premium-input" value={formData.pipeLength} onChange={(e) => setFormData({ ...formData, pipeLength: e.target.value })} required />
                                </div>
                            )}
                            <div className="input-group">
                                <label className="input-label">Delivery Date</label>
                                <input type="date" className="premium-input" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} required />
                            </div>
                        </div>

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
                                <label className="input-label">Size</label>
                                <input type="text" className="premium-input" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Wall Thickness (WT)</label>
                                <input type="text" className="premium-input" value={formData.wt} onChange={(e) => setFormData({ ...formData, wt: e.target.value })} />
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
                                <label className="input-label">Overlay Thck & Allowance</label>
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
