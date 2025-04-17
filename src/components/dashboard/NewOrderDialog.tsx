
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

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (orderData: {
    awb: string;
    customerName: string;
    customerMobile: string;
    channel: string;
  }) => void;
}

const NewOrderDialog = ({ open, onOpenChange, onSubmit }: NewOrderDialogProps) => {
  const [awb, setAwb] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [channel, setChannel] = useState("Amazon");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile number (10 digits)
    if (customerMobile.length !== 10 || !/^\d+$/.test(customerMobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    
    onSubmit({
      awb,
      customerName,
      customerMobile,
      channel,
    });
    
    // Reset form
    setAwb("");
    setCustomerName("");
    setCustomerMobile("");
    setChannel("Amazon");
    
    // Close dialog
    onOpenChange(false);
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
            <Button type="submit" className="w-full">Create Order</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
