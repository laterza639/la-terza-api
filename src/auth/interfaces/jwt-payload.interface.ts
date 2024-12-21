export interface JwtPayload {
  id: string;
  email: string;
  branch?: string;
  roles?: string[];
}