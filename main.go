package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Counter struct {
	Goal int `json:"goal"`
}

func countIt(goal int) string {
	count := 0

	fmt.Printf("We are starting to count to %d...\n", goal)

	start := time.Now()

	for count < goal {
		count = count + 1
	}

	fmt.Printf("We counted to: %d \n", count)

	duration := time.Since(start)

	str := fmt.Sprintf(
		"It took us: %s\n",
		duration,
	)

	fmt.Println(str)

	return str
}

func count(w http.ResponseWriter, req *http.Request) {
	decoder := json.NewDecoder(req.Body)

	var counter Counter

	err := decoder.Decode(&counter)
	if err != nil {
		panic(err)
	}

	result := countIt(counter.Goal)

	str := fmt.Sprintf("We counted to %d\n\n%s", counter.Goal, result)

	fmt.Fprintf(w, str)
}

func main() {
	http.HandleFunc("/count", count)

	http.ListenAndServe(":8080", nil)
}
