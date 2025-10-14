import React, { useEffect, useState } from 'react';
import { GroupService } from '../services/group.service';

interface Group {
    id: number;
    name: string;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        GroupService.getAll()
            .then(setGroups)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Список груп</h1>
            <ul className="space-y-2">
                {groups.map((g) => (
                    <li key={g.id} className="border p-2 rounded">
                        {g.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
