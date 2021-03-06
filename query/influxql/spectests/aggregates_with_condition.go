package spectests

import "fmt"

func init() {
	RegisterFixture(
		AggregateTest(func(name string) (stmt, want string) {
			return fmt.Sprintf(`SELECT %s(value) FROM db0..cpu WHERE host = 'server01'`, name),
				`package main

` + fmt.Sprintf(`from(bucketID: "%s"`, bucketID.String()) + `)
	|> range(start: 1677-09-21T00:12:43.145224194Z, stop: 2262-04-11T23:47:16.854775806Z)
	|> filter(fn: (r) => r._measurement == "cpu" and r._field == "value")
	|> filter(fn: (r) => r["host"] == "server01")
	|> group(columns: ["_measurement", "_start"], mode: "by")
	|> ` + name + `()
	|> duplicate(column: "_start", as: "_time")
	|> map(fn: (r) => ({_time: r._time, ` + name + `: r._value}), mergeKey: true)
	|> yield(name: "0")
`
		}),
	)
}
