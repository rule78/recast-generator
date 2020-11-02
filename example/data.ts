export interface ApiResponse {
  code: number;
  type: string;
  message: string;
}

export interface Category {
  id: number;
  name: string;
}

enum PetStatus {
  available = "available",
  pending = "pending",
  sold = "sold"
}

export interface Pet {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: Array<string>;
  tags?: Array<Tag>;
  status?: PetStatus;
}

export interface Tag {
  id: number;
  name: string;
}

enum OrderStatus {
  placed = "placed",
  approved = "approved",
  delivered = "delivered"
}

export interface Order {
  id: number;
  petId: number;
  quantity: number;
  shipDate: string;
  status: OrderStatus;
  complete: boolean;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userStatus: number;
}