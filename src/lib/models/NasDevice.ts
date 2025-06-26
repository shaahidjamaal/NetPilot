import mongoose, { Schema, Document } from 'mongoose';

export interface INasDevice extends Document {
  _id: string;
  nasIpAddress: string;
  shortName: string;
  nasType: 'MikroTik RouterOS' | 'Cisco' | 'Ubiquiti' | 'Other';
  description?: string;
  
  // MikroTik-specific fields
  mikrotikConfig?: {
    apiPort: number;
    username: string;
    password: string;
    connectionTimeout: number;
    enableSsl: boolean;
  };
  
  // Connection status
  isActive: boolean;
  lastConnectionTest?: Date;
  connectionStatus?: 'connected' | 'disconnected' | 'error';
  connectionMessage?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const NasDeviceSchema = new Schema<INasDevice>({
  nasIpAddress: {
    type: String,
    required: [true, 'NAS IP Address is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic IP address validation
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(v);
      },
      message: 'Please enter a valid IP address'
    }
  },
  shortName: {
    type: String,
    required: [true, 'Short Name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Short Name cannot exceed 50 characters'],
    validate: {
      validator: function(v: string) {
        // Alphanumeric and underscore/dash only
        const nameRegex = /^[a-zA-Z0-9_-]+$/;
        return nameRegex.test(v);
      },
      message: 'Short Name can only contain letters, numbers, underscores, and dashes'
    }
  },
  nasType: {
    type: String,
    required: [true, 'NAS Type is required'],
    enum: {
      values: ['MikroTik RouterOS', 'Cisco', 'Ubiquiti', 'Other'],
      message: 'Invalid NAS Type'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  mikrotikConfig: {
    apiPort: {
      type: Number,
      default: 8728,
      min: [1, 'API Port must be between 1 and 65535'],
      max: [65535, 'API Port must be between 1 and 65535']
    },
    username: {
      type: String,
      trim: true,
      maxlength: [100, 'Username cannot exceed 100 characters']
    },
    password: {
      type: String,
      maxlength: [200, 'Password cannot exceed 200 characters']
    },
    connectionTimeout: {
      type: Number,
      default: 10000,
      min: [1000, 'Connection timeout must be at least 1000ms'],
      max: [60000, 'Connection timeout cannot exceed 60000ms']
    },
    enableSsl: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastConnectionTest: {
    type: Date
  },
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'disconnected'
  },
  connectionMessage: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: [true, 'Created by user ID is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
NasDeviceSchema.index({ nasIpAddress: 1 });
NasDeviceSchema.index({ shortName: 1 });
NasDeviceSchema.index({ nasType: 1 });
NasDeviceSchema.index({ isActive: 1 });

// Virtual for formatted display
NasDeviceSchema.virtual('displayName').get(function() {
  return `${this.shortName} (${this.nasIpAddress})`;
});

// Ensure virtual fields are serialized
NasDeviceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive information from JSON output
    if (ret.mikrotikConfig && ret.mikrotikConfig.password) {
      ret.mikrotikConfig.password = '***';
    }
    return ret;
  }
});

// Pre-save middleware to handle MikroTik config
NasDeviceSchema.pre('save', function(next) {
  // Only require MikroTik config if nasType is MikroTik RouterOS
  if (this.nasType === 'MikroTik RouterOS') {
    if (!this.mikrotikConfig) {
      this.mikrotikConfig = {
        apiPort: 8728,
        username: '',
        password: '',
        connectionTimeout: 10000,
        enableSsl: false
      };
    }
  } else {
    // Clear MikroTik config for non-MikroTik devices
    this.mikrotikConfig = undefined;
  }
  next();
});

const NasDevice = mongoose.models.NasDevice || mongoose.model<INasDevice>('NasDevice', NasDeviceSchema);

export default NasDevice;
