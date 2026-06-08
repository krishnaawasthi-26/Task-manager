package com.taskvault.dto.response;

import java.util.List;
import java.util.Map;

public class PagedResponse<T> extends ApiResponse<List<T>> {
    public PagedResponse(List<T> data, String message, int page, int size, long totalElements, int totalPages, boolean last) {
        super(true, message, data, Map.of(
                "page", page,
                "size", size,
                "totalElements", totalElements,
                "totalPages", totalPages,
                "last", last
        ));
    }
}
