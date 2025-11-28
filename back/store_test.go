package main

import (
	"errors"
	"testing"
)

func newMemoryStore(t *testing.T) *Store {
	t.Helper()
	store, err := NewStore(":memory:")
	if err != nil {
		t.Fatalf("new store: %v", err)
	}
	if err := store.Init(); err != nil {
		store.Close()
		t.Fatalf("init store: %v", err)
	}
	return store
}

func mustCreateEmployee(t *testing.T, store *Store, name string) Employee {
	t.Helper()
	emp, err := store.CreateEmployee(name)
	if err != nil {
		t.Fatalf("create employee: %v", err)
	}
	return emp
}

func mustCreateReview(t *testing.T, store *Store, employeeID int64) PerformanceReview {
	t.Helper()
	review, err := store.CreatePerformanceReview(PerformanceReviewInput{
		EmployeeID:    employeeID,
		Period:        "2024-Q4",
		Reviewer:      "Manager",
		Rating:        4,
		Strengths:     "strength",
		Opportunities: "area",
	})
	if err != nil {
		t.Fatalf("create review: %v", err)
	}
	return review
}

func strPtr(s string) *string { return &s }
func intPtr(i int) *int       { return &i }

func TestStoreUpdatePerformanceReviewNoChanges(t *testing.T) {
	store := newMemoryStore(t)
	defer store.Close()

	emp := mustCreateEmployee(t, store, "Alice")
	review := mustCreateReview(t, store, emp.ID)

	got, err := store.UpdatePerformanceReview(review.ID, PerformanceReviewUpdate{})
	if err != nil {
		t.Fatalf("update review: %v", err)
	}
	if got.ID != review.ID || got.Rating != review.Rating {
		t.Fatalf("expected unchanged review, got %+v", got)
	}
}

func TestStoreUpdatePerformanceReviewNotFound(t *testing.T) {
	store := newMemoryStore(t)
	defer store.Close()

	_, err := store.UpdatePerformanceReview(999, PerformanceReviewUpdate{
		Reviewer: strPtr("boss"),
	})
	if err == nil || !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestStoreTransitionReviewNotFound(t *testing.T) {
	store := newMemoryStore(t)
	defer store.Close()

	_, err := store.TransitionPerformanceReview(123, ReviewStateSubmitted)
	if err == nil || !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestValidateReviewInput(t *testing.T) {
	valid := PerformanceReviewInput{
		EmployeeID:    1,
		Period:        "2024-Q4",
		Reviewer:      "Boss",
		Rating:        3,
		Strengths:     "A",
		Opportunities: "B",
	}
	if err := validateReviewInput(valid); err != nil {
		t.Fatalf("expected valid input, got %v", err)
	}

	cases := []struct {
		name  string
		input PerformanceReviewInput
	}{
		{"missing employee", PerformanceReviewInput{}},
		{"missing period", PerformanceReviewInput{EmployeeID: 1}},
		{"missing reviewer", PerformanceReviewInput{EmployeeID: 1, Period: "Q1"}},
		{"invalid rating", PerformanceReviewInput{EmployeeID: 1, Period: "Q1", Reviewer: "Boss", Rating: 6}},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			if err := validateReviewInput(tc.input); err == nil {
				t.Fatalf("expected error for %s", tc.name)
			}
		})
	}
}

func TestValidatePayrollInput(t *testing.T) {
	valid := PayrollRecordInput{
		EmployeeID: 1,
		Period:     "2024-11",
		BaseSalary: 1000,
	}
	if err := validatePayrollInput(valid); err != nil {
		t.Fatalf("expected valid payroll input, got %v", err)
	}

	cases := []struct {
		name  string
		input PayrollRecordInput
	}{
		{"missing employee", PayrollRecordInput{}},
		{"missing period", PayrollRecordInput{EmployeeID: 2}},
		{"negative base", PayrollRecordInput{EmployeeID: 2, Period: "2024-01", BaseSalary: -1}},
		{"negative overtime hours", PayrollRecordInput{EmployeeID: 2, Period: "2024-01", BaseSalary: 1, OvertimeHours: -1}},
		{"negative overtime rate", PayrollRecordInput{EmployeeID: 2, Period: "2024-01", BaseSalary: 1, OvertimeRate: -1}},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			if err := validatePayrollInput(tc.input); err == nil {
				t.Fatalf("expected error for %s", tc.name)
			}
		})
	}
}

func TestJoinAllowedClauses(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		got, err := joinAllowedClauses([]string{"reviewer = ?"}, allowedReviewUpdateClauses, ", ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != "reviewer = ?" {
			t.Fatalf("unexpected clause: %s", got)
		}
	})

	t.Run("empty input", func(t *testing.T) {
		got, err := joinAllowedClauses(nil, allowedReviewUpdateClauses, ", ")
		if err != nil {
			t.Fatalf("unexpected err: %v", err)
		}
		if got != "" {
			t.Fatalf("expected empty string, got %s", got)
		}
	})

	t.Run("invalid clause", func(t *testing.T) {
		if _, err := joinAllowedClauses([]string{"DROP TABLE"}, allowedReviewUpdateClauses, ", "); err == nil {
			t.Fatalf("expected error for invalid clause")
		}
	})
}

func TestBuildReviewFilter(t *testing.T) {
	clauses, args := buildReviewFilter(PerformanceReviewFilter{
		EmployeeID: 99,
		Period:     "2024-Q4",
		State:      ReviewStateDraft,
	})
	if len(clauses) != 3 || len(args) != 3 {
		t.Fatalf("expected 3 clauses and args, got %v %v", clauses, args)
	}
}

func TestBuildPayrollFilter(t *testing.T) {
	clauses, args := buildPayrollFilter(PayrollFilter{
		EmployeeID: 77,
		Period:     "2024-11",
	})
	if len(clauses) != 2 || len(args) != 2 {
		t.Fatalf("expected 2 clauses and args, got %v %v", clauses, args)
	}
}
