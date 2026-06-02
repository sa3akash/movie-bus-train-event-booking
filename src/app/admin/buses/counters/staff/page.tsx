import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StaffPage = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Counter Staff</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff</CardTitle>
          <CardDescription>
            Manage internal staff working at different counters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            No staff members found.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPage;
