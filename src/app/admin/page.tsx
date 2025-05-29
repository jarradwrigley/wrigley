// "use client"

// // export default async function ExtraPage() {

// //     return <h1 className="text-5xl">Admin Page!</h1>

// // }

// // pages/admin/index.tsx or app/admin/page.tsx
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function AdminPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "loading") return; // Still loading

//     if (!session) {
//       router.push('/api/auth/signin');
//       return;
//     }

//     if (session.user.role !== 'admin') {
//       router.push('/denied');
//       return;
//     }
//   }, [session, status, router]);

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   if (!session || session.user.role !== 'admin') {
//     return <div>Access denied</div>;
//   }

//   return (
//     <div>
//       <h1>Admin Dashboard</h1>
//       <p>Welcome, {session.user.name}!</p>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  profilePic: string;
  createdAt: string;
}

interface Tour {
  _id: string;
  date: number;
  mon: string;
  title: string;
  location: string;
  desc: string;
  link: string;
  price?: number;
  venue?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  featured: boolean;
}

interface Order {
  _id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  shippingAddress: any;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/denied");
      return;
    }

    fetchData();
  }, [session, status, router, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/${activeTab}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Debug: Log the response to see its structure
      console.log(`${activeTab} API response:`, result);

      // Extract the actual data array from the response
      // Handle both formats: direct array or wrapped in success/data structure
      let actualData;

      if (result.success && result.data) {
        // API returns: { success: true, data: [...], meta: {...} }
        actualData = result.data;
      } else if (Array.isArray(result)) {
        // API returns: [...]
        actualData = result;
      } else {
        console.error("Unexpected API response format:", result);
        actualData = [];
      }

      switch (activeTab) {
        case "users":
          setUsers(actualData);
          break;
        case "tours":
          setTours(actualData);
          break;
        case "products":
          setProducts(actualData);
          break;
        case "orders":
          setOrders(actualData);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);

      // Set empty arrays on error to prevent map errors
      switch (activeTab) {
        case "users":
          setUsers([]);
          break;
        case "tours":
          setTours([]);
          break;
        case "products":
          setProducts([]);
          break;
        case "orders":
          setOrders([]);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: any) => {
    // console.log('vvv', formData)
    try {
      const response = await fetch(`/api/admin/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchData();
        alert(`${activeTab.slice(0, -1)} created successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to create item");
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      const response = await fetch(`/api/admin/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditingItem(null);
        fetchData();
        alert(`${activeTab.slice(0, -1)} updated successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to update item");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${activeTab}?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData();
        alert(`${activeTab.slice(0, -1)} deleted successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to delete item");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Access denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {["users", "tours", "products", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setEditingItem(null);
                  setShowForm(false);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900 capitalize">
            Manage {activeTab}
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">Loading {activeTab}...</div>
        ) : (
          <>
            {/* Users Table */}
            {activeTab === "users" && (
              <UsersTable
                users={users}
                onEdit={setEditingItem}
                onDelete={handleDelete}
              />
            )}

            {/* Tours Table */}
            {activeTab === "tours" && (
              <ToursTable
                tours={tours}
                onEdit={setEditingItem}
                onDelete={handleDelete}
              />
            )}

            {/* Products Table */}
            {activeTab === "products" && (
              <ProductsTable
                products={products}
                onEdit={setEditingItem}
                onDelete={handleDelete}
              />
            )}

            {/* Orders Table */}
            {activeTab === "orders" && (
              <OrdersTable
                orders={orders}
                onEdit={setEditingItem}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

        {/* Create Form Modal */}
        {showForm && (
          <FormModal
            type={activeTab}
            onSubmit={handleCreate}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Edit Form Modal */}
        {editingItem && (
          <FormModal
            type={activeTab}
            item={editingItem}
            onSubmit={handleUpdate}
            onClose={() => setEditingItem(null)}
          />
        )}
      </div>
    </div>
  );
}

// Users Table Component
// Users Table Component with safety checks
function UsersTable({
  users,
  onEdit,
  onDelete,
}: {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}) {
  // Safety check: ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeUsers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            safeUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.profilePic || '/images/product1.avif'}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = "/images/product1.avif";
                      }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.username || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "manager"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Tours Table Component
function ToursTable({
  tours,
  onEdit,
  onDelete,
}: {
  tours: Tour[];
  onEdit: (tour: Tour) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tours.map((tour) => (
            <tr key={tour._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {tour.date} {tour.mon}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {tour.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tour.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${tour.price || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(tour)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(tour._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Products Table Component
function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Featured
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded object-cover"
                    src={product.image}
                    alt={product.name}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {product.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${product.price}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.featured
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.featured ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(product)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Orders Table Component
function OrdersTable({
  orders,
  onEdit,
  onDelete,
}: {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order._id.slice(-8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${order.total}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(order)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(order._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Form Modal Component
// function FormModal({
//   type,
//   item,
//   onSubmit,
//   onClose,
// }: {
//   type: string;
//   item?: any;
//   onSubmit: (data: any) => void;
//   onClose: () => void;
// }) {
//   const [formData, setFormData] = useState(item || {});

//   // useEffect(() => {
//   //   console.log("p3p3p3", formData);
//   // }, [formData]);


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   const renderFormFields = () => {
//     switch (type) {
//       case "users":
//         return (
//           <>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Username
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.username || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, username: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={formData.name || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   value={formData.password || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required={!item}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Role
//                 </label>
//                 <select
//                   value={formData.role || "user"}
//                   onChange={(e) =>
//                     setFormData({ ...formData, role: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 >
//                   <option value="user">User</option>
//                   <option value="manager">Manager</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Profile Picture URL
//               </label>
//               <input
//                 // type="url"
//                 value={formData.profilePic || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, profilePic: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>
//           </>
//         );

//       case "tours":
//         return (
//           <>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Date
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.date || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, date: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Month
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.mon || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, mon: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Price
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.price || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, price: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Title
//               </label>
//               <input
//                 type="text"
//                 value={formData.title || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Location
//               </label>
//               <input
//                 type="text"
//                 value={formData.location || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, location: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Venue
//               </label>
//               <input
//                 type="text"
//                 value={formData.venue || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, venue: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Description
//               </label>
//               <textarea
//                 value={formData.desc || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, desc: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 rows={3}
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Link
//               </label>
//               <input
//                 type="url"
//                 value={formData.link || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, link: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>
//           </>
//         );

//       case "products":
//         return (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={formData.name || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 rows={3}
//                 required
//               />
//             </div>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Price
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.price || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, price: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Stock
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.stock || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, stock: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Category
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.category || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Image URL
//               </label>
//               <input
//                 type="url"
//                 value={formData.image || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, image: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={formData.featured || false}
//                   onChange={(e) =>
//                     setFormData({ ...formData, featured: e.target.checked })
//                   }
//                   className="mr-2"
//                 />
//                 <span className="text-sm font-medium text-gray-700">
//                   Featured Product
//                 </span>
//               </label>
//             </div>
//           </>
//         );

//       case "orders":
//         return (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 User ID
//               </label>
//               <input
//                 type="text"
//                 value={formData.userId || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, userId: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 required={!item}
//                 disabled={!!item}
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Total
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.total || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, total: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                   required={!item}
//                   disabled={!!item}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Status
//                 </label>
//                 <select
//                   value={formData.status || "pending"}
//                   onChange={(e) =>
//                     setFormData({ ...formData, status: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="processing">Processing</option>
//                   <option value="shipped">Shipped</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Payment Method
//               </label>
//               <input
//                 type="text"
//                 value={formData.paymentMethod || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, paymentMethod: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Shipping Address
//               </label>
//               <textarea
//                 value={
//                   typeof formData.shippingAddress === "string"
//                     ? formData.shippingAddress
//                     : JSON.stringify(formData.shippingAddress || {})
//                 }
//                 onChange={(e) =>
//                   setFormData({ ...formData, shippingAddress: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 rows={3}
//                 placeholder="Enter address or JSON object"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Notes
//               </label>
//               <textarea
//                 value={formData.notes || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, notes: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 rows={2}
//               />
//             </div>
//           </>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//       <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
//         <div className="mt-3">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">
//             {item ? "Edit" : "Create"} {type.slice(0, -1)}
//           </h3>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {renderFormFields()}
//             <div className="flex justify-end space-x-4 pt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 {item ? "Update" : "Create"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
function FormModal({
  type,
  item,
  onSubmit,
  onClose,
}: {
  type: string;
  item?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  // Initialize formData with default values based on type
  const getDefaultFormData = () => {
    switch (type) {
      case "users":
        return {
          username: "",
          email: "",
          name: "",
          password: "",
          role: "user", // Default role
          profilePic: "",
          ...item, // Spread item to override defaults if editing
        };
      case "tours":
        return {
          date: "",
          mon: "",
          price: "",
          title: "",
          location: "",
          venue: "",
          desc: "",
          link: "",
          ...item,
        };
      case "products":
        return {
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          image: "",
          featured: false,
          ...item,
        };
      case "orders":
        return {
          userId: "",
          total: "",
          status: "pending",
          paymentMethod: "",
          shippingAddress: "",
          notes: "",
          ...item,
        };
      default:
        return item || {};
    }
  };

  const [formData, setFormData] = useState(getDefaultFormData());

  // Update formData when item changes (useful for editing different items)
  useEffect(() => {
    setFormData(getDefaultFormData());
  }, [item, type]);

  useEffect(() => {
    console.log("FormData with all fields:", formData);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderFormFields = () => {
    switch (type) {
      case "users":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required={!item}
                  placeholder={
                    item
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={formData.role || "user"}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture URL
              </label>
              <input
                // type="url"
                value={formData.profilePic || ""}
                onChange={(e) =>
                  setFormData({ ...formData, profilePic: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </>
        );

      case "tours":
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="number"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Month
                </label>
                <input
                  type="text"
                  value={formData.mon || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mon: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue || ""}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.desc || ""}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Link
              </label>
              <input
                type="url"
                value={formData.link || ""}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </>
        );

      case "products":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Product
                </span>
              </label>
            </div>
          </>
        );

      case "orders":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <input
                type="text"
                value={formData.userId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required={!item}
                disabled={!!item}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, total: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required={!item}
                  disabled={!!item}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status || "pending"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <input
                type="text"
                value={formData.paymentMethod || ""}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipping Address
              </label>
              <textarea
                value={
                  typeof formData.shippingAddress === "string"
                    ? formData.shippingAddress
                    : JSON.stringify(formData.shippingAddress || {})
                }
                onChange={(e) =>
                  setFormData({ ...formData, shippingAddress: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Enter address or JSON object"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={2}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {item ? "Edit" : "Create"} {type.slice(0, -1)}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderFormFields()}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {item ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
