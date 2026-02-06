// Standard API response format

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const successResponse = <T>(data: T): ApiResponse<T> => {
  return {
    success: true,
    data,
  };
};

export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ApiResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
};
