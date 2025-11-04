package main

import (
	"database/sql"
	"errors"

	_ "modernc.org/sqlite"
)

type Employee struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

var ErrNotFound = errors.New("not found")

type Store struct {
	db *sql.DB
}

func NewStore(dsn string) (*Store, error) {
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	return &Store{db: db}, nil
}

func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *Store) Init() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS employees (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);
	`)
	return err
}

func (s *Store) ListEmployees() ([]Employee, error) {
	rows, err := s.db.Query("SELECT id, name FROM employees ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

    // Ensure non-nil slice so JSON encodes as [] instead of null
    result := make([]Employee, 0)
	for rows.Next() {
		var e Employee
		if err := rows.Scan(&e.ID, &e.Name); err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, rows.Err()
}

func (s *Store) CreateEmployee(name string) (Employee, error) {
	res, err := s.db.Exec("INSERT INTO employees(name) VALUES(?)", name)
	if err != nil {
		return Employee{}, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return Employee{}, err
	}
	return Employee{ID: id, Name: name}, nil
}

func (s *Store) UpdateEmployee(id int64, name string) (Employee, error) {
	res, err := s.db.Exec("UPDATE employees SET name=? WHERE id=?", name, id)
	if err != nil {
		return Employee{}, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return Employee{}, err
	}
	if affected == 0 {
		return Employee{}, ErrNotFound
	}
	return Employee{ID: id, Name: name}, nil
}


