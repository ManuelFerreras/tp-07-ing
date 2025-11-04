package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

type API struct {
	store *Store
}

func NewAPI(store *Store) *API {
	return &API{store: store}
}

const internalErrorMsg = "internal error"

func (a *API) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/employees", func(w http.ResponseWriter, r *http.Request) {
		setJSON(w)
		switch r.Method {
		case http.MethodGet:
			a.handleListEmployees(w, r)
		case http.MethodPost:
			a.handleCreateEmployee(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/employees/", func(w http.ResponseWriter, r *http.Request) {
		setJSON(w)
		if r.Method != http.MethodPut {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		idStr := strings.TrimPrefix(r.URL.Path, "/employees/")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			writeError(w, http.StatusUnprocessableEntity, "invalid id")
			return
		}
		a.handleUpdateEmployee(w, r, id)
	})
}

func setJSON(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
}

func writeError(w http.ResponseWriter, code int, msg string) {
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

type employeePayload struct {
	Name string `json:"name"`
}

func (a *API) handleListEmployees(w http.ResponseWriter, _ *http.Request) {
	list, err := a.store.ListEmployees()
	if err != nil {
        writeError(w, http.StatusInternalServerError, internalErrorMsg)
		return
	}
	_ = json.NewEncoder(w).Encode(list)
}

func (a *API) handleCreateEmployee(w http.ResponseWriter, r *http.Request) {
	var p employeePayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid payload")
		return
	}
	name := strings.TrimSpace(p.Name)
	if name == "" {
		writeError(w, http.StatusUnprocessableEntity, "name is required")
		return
	}
	created, err := a.store.CreateEmployee(name)
	if err != nil {
        writeError(w, http.StatusInternalServerError, internalErrorMsg)
		return
	}
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(created)
}

func (a *API) handleUpdateEmployee(w http.ResponseWriter, r *http.Request, id int64) {
	var p employeePayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid payload")
		return
	}
	name := strings.TrimSpace(p.Name)
	if name == "" {
		writeError(w, http.StatusUnprocessableEntity, "name is required")
		return
	}
	updated, err := a.store.UpdateEmployee(id, name)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
        writeError(w, http.StatusInternalServerError, internalErrorMsg)
		return
	}
	_ = json.NewEncoder(w).Encode(updated)
}


