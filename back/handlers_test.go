package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func setupTestServer(t *testing.T) (*Store, *http.ServeMux) {
	t.Helper()
	store, err := NewStore(":memory:")
	if err != nil {
		t.Fatalf("new store: %v", err)
	}
	if err := store.Init(); err != nil {
		store.Close()
		t.Fatalf("init store: %v", err)
	}
	mux := http.NewServeMux()
	NewAPI(store).RegisterRoutes(mux)
	return store, mux
}

func doJSON(t *testing.T, mux *http.ServeMux, method, path string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var r io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		r = bytes.NewReader(b)
	}
	req := httptest.NewRequest(method, path, r)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)
	return rr
}

func TestCreateEmployee_ok(t *testing.T) {
	store, mux := setupTestServer(t)
	defer store.Close()

	resp := doJSON(t, mux, http.MethodPost, "/employees", map[string]string{"name": "Alice"})
	if resp.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.Code)
	}
	var got Employee
	if err := json.Unmarshal(resp.Body.Bytes(), &got); err != nil {
		t.Fatalf("json: %v", err)
	}
	if got.ID == 0 || got.Name != "Alice" {
		t.Fatalf("unexpected body: %+v", got)
	}
}

func TestUpdateEmployee_ok(t *testing.T) {
	store, mux := setupTestServer(t)
	defer store.Close()

	created, err := store.CreateEmployee("Bob")
	if err != nil {
		t.Fatalf("seed: %v", err)
	}
	resp := doJSON(t, mux, http.MethodPut, "/employees/1", map[string]string{"name": "Robert"})
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.Code)
	}
	var got Employee
	if err := json.Unmarshal(resp.Body.Bytes(), &got); err != nil {
		t.Fatalf("json: %v", err)
	}
	if got.ID != created.ID || got.Name != "Robert" {
		t.Fatalf("unexpected body: %+v", got)
	}
}

func TestCreateEmployee_422(t *testing.T) {
	store, mux := setupTestServer(t)
	defer store.Close()

	resp := doJSON(t, mux, http.MethodPost, "/employees", map[string]string{"name": "  "})
	if resp.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422, got %d", resp.Code)
	}
}

func TestUpdateEmployee_404(t *testing.T) {
	store, mux := setupTestServer(t)
	defer store.Close()

	resp := doJSON(t, mux, http.MethodPut, "/employees/999", map[string]string{"name": "X"})
	if resp.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", resp.Code)
	}
}


