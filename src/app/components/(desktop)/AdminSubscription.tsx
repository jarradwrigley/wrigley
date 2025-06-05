// /models/subscription.ts - Updated Mongoose Model
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  deviceName: string;
  imei: string;
  phoneNumber: string;
  email: string;
  subscriptionType: string;
  subscriptionCards: string[];
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'queued' | 'active' | 'expired' | 'rejected';
  queuePosition?: number;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  imei: {
    type: String,
    required: true,
    match: /^\d{15}$/,
    index: true // Index for faster queries by IMEI
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subscriptionType: {
    type: String,
    required: true,
    enum: [
      'mobile-v4-basic',
      'mobile-v4-premium', 
      'mobile-v4-enterprise',
      'mobile-v5-basic',
      'mobile-v5-premium',
      'full-suite-basic',
      'full-suite-premium'
    ]
  },
  subscriptionCards: [{
    type: String,
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'queued', 'active', 'expired', 'rejected'],
    default: 'pending',
    index: true
  },
  queuePosition: {
    type: Number,
    min: 1
  },
  adminNotes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queue queries
subscriptionSchema.index({ imei: 1, status: 1, queuePosition: 1 });

// Pre-save middleware to update updatedAt
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Subscription = mongoose.models.Subscription || 
  mongoose.model<ISubscription>('Subscription', subscriptionSchema);

// /components/admin/SubscriptionQueue.tsx - Admin Interface
import React, { useState, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar,
  AlertTriangle,
  Download,
  MessageSquare
} from 'lucide-react';

interface AdminSubscription extends ISubscription {
  _id: string;
}

interface SubscriptionQueueProps {
  subscriptions: AdminSubscription[];
  onStatusUpdate: (id: string, status: string, notes?: string) => Promise<void>;
  onRefresh: () => void;
}

const SubscriptionQueue: React.FC<SubscriptionQueueProps> = ({
  subscriptions,
  onStatusUpdate,
  onRefresh
}) => {
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'queued': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSubscriptionTypeLabel = (type: string) => {
    const labels = {
      'mobile-v4-basic': 'Mobile v4 Basic (30d)',
      'mobile-v4-premium': 'Mobile v4 Premium (90d)',
      'mobile-v4-enterprise': 'Mobile v4 Enterprise (180d)',
      'mobile-v5-basic': 'Mobile v5 Basic (30d)',
      'mobile-v5-premium': 'Mobile v5 Premium (90d)',
      'full-suite-basic': 'Full Suite Basic (60d)',
      'full-suite-premium': 'Full Suite Premium (120d)'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleStatusUpdate = useCallback(async (
    id: string, 
    newStatus: string
  ) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(id, newStatus, adminNotes);
      setSelectedSub(null);
      setAdminNotes('');
      onRefresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [onStatusUpdate, adminNotes, onRefresh]);

  const groupedSubscriptions = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.imei]) {
      acc[sub.imei] = [];
    }
    acc[sub.imei].push(sub);
    return acc;
  }, {} as Record<string, AdminSubscription[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Queue Management</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            Pending Reviews ({subscriptions.filter(s => s.status === 'pending').length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {subscriptions
            .filter(sub => sub.status === 'pending')
            .map(subscription => (
              <div key={subscription._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {subscription.deviceName}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>IMEI:</strong> {subscription.imei}</p>
                        <p><strong>Email:</strong> {subscription.email}</p>
                        <p><strong>Phone:</strong> {subscription.phoneNumber}</p>
                      </div>
                      <div>
                        <p><strong>Plan:</strong> {getSubscriptionTypeLabel(subscription.subscriptionType)}</p>
                        <p><strong>Submitted:</strong> {new Date(subscription.createdAt).toLocaleDateString()}</p>
                        <p><strong>Queue Position:</strong> {subscription.queuePosition}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedSub(subscription)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      <Eye size={14} className="inline mr-1" />
                      Review
                    </button>
                  </div>
                </div>
                
                {/* Verification Documents */}
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Verification Documents:</p>
                  <div className="flex gap-2">
                    {subscription.subscriptionCards.map((cardUrl, index) => (
                      <a
                        key={index}
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                      >
                        <Download size={12} />
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Device Queue Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User size={20} />
            Device Queue Overview
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedSubscriptions).map(([imei, subs]) => {
            const activeSub = subs.find(s => s.status === 'active');
            const queuedSubs = subs.filter(s => s.status === 'queued').sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));
            
            return (
              <div key={imei} className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900">IMEI: {imei}</h4>
                  {activeSub && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">
                        Active: {activeSub.deviceName} - {getSubscriptionTypeLabel(activeSub.subscriptionType)}
                      </p>
                      <p className="text-xs text-green-600">
                        Expires: {new Date(activeSub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                
                {queuedSubs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Queue ({queuedSubs.length}):</p>
                    <div className="space-y-1">
                      {queuedSubs.map((sub, index) => (
                        <div key={sub._id} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                          <span>
                            #{index + 1}: {sub.deviceName} - {getSubscriptionTypeLabel(sub.subscriptionType)}
                          </span>
                          <span className="text-blue-600">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Review Subscription: {selectedSub.deviceName}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Device:</strong> {selectedSub.deviceName}</p>
                    <p><strong>IMEI:</strong> {selectedSub.imei}</p>
                    <p><strong>Email:</strong> {selectedSub.email}</p>
                    <p><strong>Phone:</strong> {selectedSub.phoneNumber}</p>
                  </div>
                  <div>
                    <p><strong>Plan:</strong> {getSubscriptionTypeLabel(selectedSub.subscriptionType)}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedSub.createdAt).toLocaleString()}</p>
                    <p><strong>Queue Position:</strong> {selectedSub.queuePosition}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Verification Documents:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSub.subscriptionCards.map((cardUrl, index) => (
                      <a
                        key={index}
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        <Download size={16} />
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Add notes about verification, issues, etc..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedSub._id, 'rejected')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  <XCircle size={16} className="inline mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedSub._id, 'active')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  <CheckCircle size={16} className="inline mr-1" />
                  {isUpdating ? 'Processing...' : 'Approve & Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionQueue;