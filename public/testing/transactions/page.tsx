"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";

// Static mock data for transactions to avoid hydration mismatch
const allTransactions = [
  { id: "TRX-10000", customer: "Alice Smith", email: "alice@example.com", event: "Avengers: Endgame", type: "Movie", amount: "$30.00", date: "2024-05-10", status: "Completed" },
  { id: "TRX-10001", customer: "Bob Johnson", email: "bob@example.com", event: "Eras Tour", type: "Concert", amount: "$250.00", date: "2024-05-12", status: "Pending" },
  { id: "TRX-10002", customer: "Charlie Brown", email: "charlie@example.com", event: "NYC Express", type: "Bus", amount: "$45.00", date: "2024-05-14", status: "Completed" },
  { id: "TRX-10003", customer: "Diana Prince", email: "diana@example.com", event: "Acela Train", type: "Train", amount: "$120.00", date: "2024-05-15", status: "Failed" },
  { id: "TRX-10004", customer: "Ethan Hunt", email: "ethan@example.com", event: "Inception 10th Anniv.", type: "Movie", amount: "$15.00", date: "2024-05-16", status: "Completed" },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = allTransactions.filter(
    (tx) =>
      tx.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage all ticket sales and payments across all categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                A list of your recent transactions.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-primary">
                        {tx.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.customer}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.email}
                        </div>
                      </TableCell>
                      <TableCell>{tx.event}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                      <TableCell className="text-right font-medium">{tx.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "Completed"
                              ? "default"
                              : tx.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className="bg-opacity-10 shadow-none"
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
