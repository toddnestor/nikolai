package counter

import (
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"os"
	"regexp"
	"time"
)

const tableName = "Counters"

var (
	memoizedDynamoClient dynamodbiface.DynamoDBAPI
)

func dynamoClient() dynamodbiface.DynamoDBAPI {
	if memoizedDynamoClient != nil {
		return memoizedDynamoClient
	}

	region := os.Getenv("AWS_REGION")
	awsSession, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)
	if err != nil {
		panic(err)
	}

	memoizedDynamoClient = dynamodb.New(awsSession)

	return memoizedDynamoClient
}

type Record struct {
	Id        string `json:"Id"`
	Goal      int    `json:"goal"`
	Duration  string `json:"duration"`
	Completed bool   `json:"completed"`
}

func (record *Record) Save() {
	av, err := dynamodbattribute.MarshalMap(record)
	if err != nil {
		panic("Panic at the disco")
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(tableName),
	}

	_, err = dynamoClient().PutItem(input)
	if err != nil {
		panic(fmt.Sprintf("Uh oh, couldn't save: %s", err))
	}
}

func (record *Record) FetchValues() {
	input := &dynamodb.GetItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"Id": {
				S: aws.String(record.Id),
			},
		},
		TableName: aws.String(tableName),
	}

	result, err := dynamoClient().GetItem(input)
	if err != nil {
		panic(fmt.Sprintf("uh oh: %s", err))
	}

	err = dynamodbattribute.UnmarshalMap(result.Item, record)
	if err != nil {
		panic(fmt.Sprintf("uh oh again: %s", err))
	}
}

func (record *Record) Count() {
	count := 0

	fmt.Printf("We are starting to count to %d...\n", record.Goal)

	start := time.Now()

	for count < record.Goal {
		count = count + 1
	}

	fmt.Printf("We counted to: %d \n", count)

	duration := time.Since(start)

	str := fmt.Sprintf(
		"It took us: %s\n",
		duration,
	)

	regex := regexp.MustCompile(`\.\d+`)

	str = regex.ReplaceAllString(str, "")

	fmt.Println(str)

	record.Duration = str
	record.Completed = true
}