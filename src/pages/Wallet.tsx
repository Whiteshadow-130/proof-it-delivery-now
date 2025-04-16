
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet as WalletIcon,
  Plus,
  DollarSign,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Mock transaction data
const mockTransactions = [
  {
    id: "TX-1234",
    date: "2025-04-15",
    type: "Credit",
    description: "Wallet top-up",
    amount: "₹500.00",
  },
  {
    id: "TX-1233",
    date: "2025-04-14",
    type: "Debit",
    description: "Video upload - Order #ORD-12345",
    amount: "-₹5.00",
  },
  {
    id: "TX-1232",
    date: "2025-04-14",
    type: "Debit",
    description: "Video upload - Order #ORD-12346",
    amount: "-₹5.00",
  },
  {
    id: "TX-1231",
    date: "2025-04-13",
    type: "Debit",
    description: "Video upload - Order #ORD-12347",
    amount: "-₹5.00",
  },
  {
    id: "TX-1230",
    date: "2025-04-10",
    type: "Credit",
    description: "Wallet top-up",
    amount: "₹1000.00",
  },
];

const Wallet = () => {
  const [addMoneyDialog, setAddMoneyDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddMoney = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast({
      title: "Payment successful",
      description: `₹${amount} has been added to your wallet.`,
    });
    
    setProcessing(false);
    setAddMoneyDialog(false);
    setAmount("");
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <Button onClick={() => setAddMoneyDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Money
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹1,485.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for video uploads
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Videos Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">297</div>
            <p className="text-xs text-muted-foreground mt-1">
              At ₹5 per video upload
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm">89 / 300 videos</p>
                <p className="text-sm font-medium">30%</p>
              </div>
              <Progress value={30} className="h-2" />
              <p className="text-xs text-muted-foreground">This month's usage</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{transaction.id}</td>
                        <td className="py-3 px-4 text-sm">{transaction.date}</td>
                        <td className="py-3 px-4 text-sm">{transaction.description}</td>
                        <td className={`py-3 px-4 text-sm text-right ${transaction.type === "Credit" ? "text-green-600" : "text-gray-600"}`}>
                          {transaction.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Basic Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">₹499</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 100 video uploads
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 30-day video storage
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> Basic reporting
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Subscribe</Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-brand-accent relative">
              <div className="absolute top-0 right-0 bg-brand-accent text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Professional Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">₹999</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 250 video uploads
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 90-day video storage
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> Advanced reporting
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> Email notifications
                  </li>
                </ul>
                <Button className="w-full">Subscribe</Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Enterprise Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">₹1999</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 600 video uploads
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 1-year video storage
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> Custom reporting
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> API access
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> White labeling
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Subscribe</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addMoneyDialog} onOpenChange={setAddMoneyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Choose an amount to add to your wallet. Payment will be processed securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                type="number"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-sm text-gray-500">Minimum amount: ₹100</p>
            </div>

            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setAmount("500")}
                  className={amount === "500" ? "border-brand-accent text-brand-accent" : ""}
                >
                  ₹500
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setAmount("1000")}
                  className={amount === "1000" ? "border-brand-accent text-brand-accent" : ""}
                >
                  ₹1,000
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setAmount("2000")}
                  className={amount === "2000" ? "border-brand-accent text-brand-accent" : ""}
                >
                  ₹2,000
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center border rounded-md p-3">
                  <CreditCard className="mr-3 h-5 w-5 text-brand-accent" />
                  <div>
                    <p className="font-medium">Credit / Debit Card</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <div className="relative">
                    <Input id="expiry" placeholder="MM/YY" />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMoneyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMoney} 
              disabled={!amount || Number(amount) < 100 || processing}
            >
              {processing ? "Processing..." : `Pay ₹${amount || "0"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Wallet;
