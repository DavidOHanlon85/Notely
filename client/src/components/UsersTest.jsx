import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersTest() {
    const [users, setUsers] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
    axios
        .get('http://localhost:3002/users')
        .then(res => setUsers(res.data))
        .catch(err => setError(err.message));
    }, []);

    if(error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if(!users) return <p>Loading users...</p>;

    if (!Array.isArray(users)) return <p>Data is not a list</p>;

    return (
        <ul>
            {users.map(user => (
                <li key={user.user_id}>
                    {user.user_username ?? 'no name'} + {user.user_email_address ?? 'noemail'}
                </li>
            ))}
        </ul>
    );
}