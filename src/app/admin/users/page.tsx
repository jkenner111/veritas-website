import { loadUsers } from "@/lib/users";
import { UserManagement } from "./UserManagement";

export const dynamic = "force-dynamic";

export default function AdminUsers() {
  const users = loadUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-gray-500">
        {users.length} authorized admin users. Stored in users.json.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    u.role === "owner" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-700"
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <UserManagement email={u.email} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="mt-8">
        <UserManagement />
      </div>
    </div>
  );
}
