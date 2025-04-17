
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (orderData: {
    id: string;
    awb: string;
    customerName: string;
    customerMobile: string;
    channel: string;
    date: string;
    status: string;
  }) => void;
}

const NewOrderDialog = ({ open, onOpenChange, onSubmit }: NewOrderDialogProps) => {
  const [awb, setAwb] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [channel, setChannel] = useState("Amazon");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile number (10 digits)
    if (customerMobile.length !== 10 || !/^\d+$/.test(customerMobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate a unique order number
      const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          awb: awb,
          customer_name: customerName,
          customer_mobile: customerMobile,
          channel: channel,
          status: 'QR Generated'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Prepare data for the parent component
      onSubmit({
        id: orderNumber,
        awb,
        customerName,
        customerMobile,
        channel,
        date: new Date().toISOString().split('T')[0],
        status: "QR Generated"
      });
      
      toast.success(`New order ${orderNumber} created successfully`);
      
      // Reset form
      setAwb("");
      setCustomerName("");
      setCustomerMobile("");
      setChannel("Amazon");
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Enter order details to generate a QR code for delivery verification.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="awb">AWB Number</Label>
            <Input
              id="awb"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerMobile">Customer Mobile Number</Label>
            <Input
              id="customerMobile"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="10-digit mobile number"
              required
              pattern="[0-9]{10}"
              maxLength={10}
            />
            <p className="text-xs text-gray-500">Required for OTP verification</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="channel">Sales Channel</Label>
            <Select value={channel} onValueChange={setChannel} required>
              <SelectTrigger id="channel">
                <SelectValue placeholder="Select sales channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="Shopify">Shopify</SelectItem>
                <SelectItem value="Flipkart">Flipkart</SelectItem>
                <SelectItem value="Meesho">Meesho</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
