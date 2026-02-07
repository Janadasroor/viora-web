export interface Notification {
  notificationId: number;
  recipientId: string;
  actorId: string;
  notificationType: string;
  targetType: string;
  targetId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  actor?: {
    username?: string;
    profilePicture?: string | null;
  };
  aggregation?: {
    count: number;
    actorIds: string[];
    sampleActors: string[];
  } | null;
}

