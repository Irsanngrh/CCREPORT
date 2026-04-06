import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Key, ArrowLeft, Pencil } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { usersApi } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/helpers.js';

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [newForm, setNewForm] = useState({ username: '', password: '', role: 'user' });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ id: null, username: '', role: 'user' });
    const [editingUser, setEditingUser] = useState(false);
    const [editError, setEditError] = useState('');

    const [showPwd, setShowPwd] = useState(false);
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
    const [changingPwd, setChangingPwd] = useState(false);
    const [pwdError, setPwdError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await usersApi.getAll();
            const sortedUsers = res.data.data.sort((a, b) => a.id - b.id);
            setUsers(sortedUsers);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError('');
        try {
            await usersApi.create(newForm);
            toast.success('Pengguna berhasil dibuat');
            setShowCreate(false);
            setNewForm({ username: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            setCreateError(getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (user) => {
        setEditForm({ id: user.id, username: user.username, role: user.role });
        setShowEdit(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setEditingUser(true);
        setEditError('');
        try {
            await usersApi.update(editForm.id, { username: editForm.username, role: editForm.role });
            toast.success('Pengguna berhasil diperbarui');
            setShowEdit(false);
            fetchUsers();
            if (editForm.id === currentUser?.id && editForm.username !== currentUser.username) {
                toast.success('Username diubah. Silakan login kembali jika diperlukan.');
            }
        } catch (err) {
            setEditError(getErrorMessage(err));
        } finally {
            setEditingUser(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await usersApi.delete(deleteTarget.id);
            toast.success('Pengguna berhasil dihapus');
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    };

    const handleChangePwd = async (e) => {
        e.preventDefault();
        setChangingPwd(true);
        setPwdError('');
        try {
            await usersApi.changePassword(pwdForm);
            toast.success('Password berhasil diganti');
            setShowPwd(false);
            setPwdForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setPwdError(getErrorMessage(err));
        } finally {
            setChangingPwd(false);
        }
    };

    return (
        <Layout>
            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Manajemen Pengguna</h1>
                    <p className="page-subtitle">Kelola hak akses dan akun karyawan</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary" onClick={() => setShowPwd(true)}>
                        <Key size={14} /> Ganti Password
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={14} /> Tambah Pengguna
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-full"><div className="spinner" /></div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <Users size={40} className="empty-state-icon" />
                        <div className="empty-state-title">Tidak ada pengguna ditemukan</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="nowrap">#</th>
                                <th className="nowrap">Nama Pengguna</th>
                                <th className="nowrap">Peran</th>
                                <th className="right nowrap">Aksi Lanjutan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Rendering baris tabel dengan indexing angka 1, 2, 3 berurutan */}
                            {users.map((u, idx) => (
                                <tr key={u.id}>
                                    <td className="text-muted">{u.id}</td>
                                    <td className="font-semibold">
                                        {u.username}
                                        {u.id === currentUser?.id && (
                                            <span className="badge badge-primary ml-2" style={{ marginLeft: 8 }}>Anda</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-default'}`} style={{ textTransform: 'capitalize' }}>
                                            {u.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="right nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                className="btn-icon"
                                                title="Edit"
                                                onClick={() => startEdit(u)}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                title="Delete"
                                                onClick={() => setDeleteTarget(u)}
                                                disabled={u.id === currentUser?.id}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create User Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Tambah Pengguna</h2>
                            <button className="btn-icon" onClick={() => setShowCreate(false)}><span style={{ fontSize: 18 }}>×</span></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                {createError && <div className="alert alert-danger mb-4">{createError}</div>}
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Nama Pengguna</label>
                                        <input type="text" className="form-control" value={newForm.username} onChange={e => setNewForm({ ...newForm, username: e.target.value })} required minLength={3} placeholder="Maks. 20 Karakter" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Kata Sandi</label>
                                        <input type="password" className="form-control" value={newForm.password} onChange={e => setNewForm({ ...newForm, password: e.target.value })} required minLength={8} placeholder="Min. 8 karakter" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Peran</label>
                                        <select className="form-control" value={newForm.role} onChange={e => setNewForm({ ...newForm, role: e.target.value })}>
                                            <option value="user">Karyawan (User)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Simpan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {showPwd && (
                <div className="modal-overlay" onClick={() => setShowPwd(false)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Ganti Password</h2>
                            <button className="btn-icon" onClick={() => setShowPwd(false)}><span style={{ fontSize: 18 }}>×</span></button>
                        </div>
                        <form onSubmit={handleChangePwd}>
                            <div className="modal-body">
                                {pwdError && <div className="alert alert-danger mb-4">{pwdError}</div>}
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Password Lama</label>
                                        <input type="password" className="form-control" value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password Baru</label>
                                        <input type="password" className="form-control" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required minLength={8} placeholder="Min. 8 karakter" />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPwd(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={changingPwd}>
                                    {changingPwd ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEdit && (
                <div className="modal-overlay" onClick={() => setShowEdit(false)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Ubah Detail Pengguna</h2>
                            <button className="btn-icon" onClick={() => setShowEdit(false)}><span style={{ fontSize: 18 }}>×</span></button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="modal-body">
                                {editError && <div className="alert alert-danger mb-4">{editError}</div>}
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Nama Pengguna</label>
                                        <input type="text" className="form-control" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} required minLength={3} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Peran</label>
                                        <select className="form-control" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} disabled={editForm.id === currentUser?.id}>
                                            <option value="user">Karyawan (User)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={editingUser}>
                                    {editingUser ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <Trash2 size={36} style={{ margin: '0 auto 16px', color: 'var(--color-danger)', opacity: 0.7 }} />
                            <h2 className="font-semibold" style={{ fontSize: 16, marginBottom: 8 }}>Hapus pengguna ini?</h2>
                            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                                <strong>{deleteTarget.username}</strong><br />Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary w-full" onClick={() => setDeleteTarget(null)}>Batal</button>
                                <button className="btn btn-danger w-full" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Hapus Secara Permanen'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
