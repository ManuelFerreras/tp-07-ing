package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "./employees.db"
	}
	store, err := NewStore(dsn)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer store.Close()
	if err := store.Init(); err != nil {
		log.Fatalf("failed to init db: %v", err)
	}

	mux := http.NewServeMux()
	api := NewAPI(store)
	api.RegisterRoutes(mux)

	addr := ":8080"
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}


