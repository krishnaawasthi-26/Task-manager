package com.taskvault.dto.response;

import java.util.Map;

public class ApiResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final Map<String, Object> meta;

    public ApiResponse(boolean success, String message, T data, Map<String, Object> meta) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.meta = meta;
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static ApiResponse<Void> error(String message, String code) {
        return new ApiResponse<>(false, message, null, Map.of("code", code));
    }

    public static ApiResponse<Void> error(String message, String code, Map<String, Object> meta) {
        return new ApiResponse<>(false, message, null, meta == null ? Map.of("code", code) : meta);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public Map<String, Object> getMeta() {
        return meta;
    }
}
