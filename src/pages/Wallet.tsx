
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Wallet = () => {
  const { user } = useAuth();
  const [addMoneyDialog, setAddMoneyDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState("0");
  const [videosRemaining, setVideosRemaining] = useState(0);
  const [usagePercentage, setUsagePercentage] = useState(0);
  const [usageText, setUsageText] = useState("0 / 0 videos");
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user data with company information
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, companies(id, name)')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          toast({
            title: "Error loading user data",
            description: "Please refresh the page",
            variant: "destructive"
          });
          return;
        }

        const companyId = userData?.company_id;
        if (!companyId) {
          console.error("No company ID found for user");
          return;
        }

        // Fetch wallet balance from transactions (sum credits - debits)
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        
        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
          return;
        }

        // Calculate balance from transactions
        let calculatedBalance = 0;
        const formattedTransactions = transactionsData?.map(tx => {
          // Assuming credits are positive and debits are negative
          const amount = tx.type === 'Credit' ? tx.amount : -tx.amount;
          calculatedBalance += Number(amount);
          
          return {
            id: tx.id,
            date: new Date(tx.created_at).toISOString().split('T')[0],
            type: tx.type,
            description: tx.description || 'Transaction',
            amount: tx.type === 'Credit' ? `₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`
          };
        }) || [];

        // If no real transactions exist, create some sample ones for new users
        if (formattedTransactions.length === 0) {
          // Create an initial credit transaction for new users
          const { data: newTx, error: newTxError } = await supabase
            .from('transactions')
            .insert([{
              company_id: companyId,
              user_id: user.id,
              type: 'Credit',
              amount: 1000,
              description: 'Initial wallet balance',
              status: 'completed'
            }])
            .select();
            
          if (newTxError) {
            console.error("Error creating initial transaction:", newTxError);
          } else if (newTx) {
            formattedTransactions.push({
              id: newTx[0].id,
              date: new Date(newTx[0].created_at).toISOString().split('T')[0],
              type: 'Credit',
              description: 'Initial wallet balance',
              amount: `₹${newTx[0].amount.toFixed(2)}`
            });
            calculatedBalance = 1000;
          }
        }
        
        // Set calculated data
        setBalance(calculatedBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
        setTransactions(formattedTransactions);
        
        // Calculate videos remaining (assuming ₹5 per video)
        const remainingVideos = Math.floor(calculatedBalance / 5);
        setVideosRemaining(remainingVideos);
        
        // Set usage data (mock for now, could be based on real usage data)
        const monthlyTarget = 300; // Example monthly target
        const usedCount = 89; // Example used count, could fetch from actual usage data
        const percentage = Math.round((usedCount / monthlyTarget) * 100);
        
        setUsagePercentage(percentage);
        setUsageText(`${usedCount} / ${monthlyTarget} videos`);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        toast({
          title: "Error loading wallet data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [user, toast]);

  const handleAddMoney = async () => {
    setProcessing(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to add money",
          variant: "destructive"
        });
        return;
      }
      
      // Get user's company_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (userError || !userData?.company_id) {
        console.error("Error getting company ID:", userError);
        toast({
          title: "Transaction failed",
          description: "Could not identify your account",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Create transaction record
      const amountNum = parseFloat(amount);
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          company_id: userData.company_id,
          user_id: user.id,
          type: 'Credit',
          amount: amountNum,
          description: 'Wallet top-up',
          status: 'completed'
        }]);
      
      if (txError) {
        console.error("Error recording transaction:", txError);
        toast({
          title: "Transaction recording failed",
          description: "The payment was processed but we couldn't record it",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Payment successful",
        description: `₹${amount} has been added to your wallet.`,
      });
      
      // Refresh wallet data
      const newBalance = parseFloat(balance.replace(/,/g, '')) + amountNum;
      setBalance(newBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
      
      // Add new transaction to the list
      const newTx = {
        id: `TX-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Credit',
        description: 'Wallet top-up',
        amount: `₹${amountNum.toFixed(2)}`
      };
      
      setTransactions([newTx, ...transactions]);
      
      // Update videos remaining
      const newRemaining = Math.floor(newBalance / 5);
      setVideosRemaining(newRemaining);
      
      setAddMoneyDialog(false);
      setAmount("");
    } catch (error) {
      console.error("Error adding money:", error);
      toast({
        title: "Payment failed",
        description: "Please try again or use a different payment method",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
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
            <div className="text-3xl font-bold">₹{balance}</div>
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
            <div className="text-3xl font-bold">{videosRemaining}</div>
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
                <p className="text-sm">{usageText}</p>
                <p className="text-sm font-medium">{usagePercentage}%</p>
              </div>
              <Progress value={usagePercentage} className="h-2" />
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
              {loading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No transactions found</div>
              ) : (
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
                      {transactions.map((transaction) => (
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
              )}
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
