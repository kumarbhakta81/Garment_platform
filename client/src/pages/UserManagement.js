import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, updateUser } from '../api/userApi';
import { Modal, Button, Form } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    setMessage('User deleted');
    fetchUsers();
  };

  const handleEdit = (user) => {
    setSelected(user);
    setEditForm({ username: user.username, email: user.email });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    await updateUser(selected.id, editForm);
    setMessage('User updated');
    setShowModal(false);
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">User Management</h2>
        <input
          className="form-control mb-2"
          placeholder="Search by username or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {message && <div className="alert alert-success">{message}</div>}
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <Button variant="primary" size="sm" onClick={() => handleEdit(user)} className="me-2">Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdate}>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};
export default UserManagement;
