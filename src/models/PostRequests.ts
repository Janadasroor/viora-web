export interface MediaFile {
  mediaId: number;
  altText?: string | null;
  mediaUrl?: string | null;
}

export interface CreatePostRequest {
  caption: string;
  postType: string;
  visibility: string;
  location?: string | null;
  hashtags?: string[];
  mediaFiles?: MediaFile[];
  status?: string;
}

export interface CreatePostResponse {
  postId: number;
}

export interface UpdatePostRequest {
  caption?: string | null;
  location?: string | null;
  visibility?: string | null;
}
