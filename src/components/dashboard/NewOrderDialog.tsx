
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface NewOrderData {
  orderId: string;
  awb: string;
  customerName: string;
  channel: string;
}

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewOrderDialog = ({ open, onOpenChange }: NewOrderDialogProps) => {
  const [newOrderData, setNewOrderData] = useState<NewOrderData>({
    orderId: "",
    awb: "",
    customerName: "",
    channel: "",
  });
  const { toast } = useToast();

  const handleNewOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrderData({
      ...newOrderData,
      [name]: value,
    });
  };

  const handleNewOrderSubmit = () => {
    toast({
      title: "Order created",
      description: `QR code generated for order ${newOrderData.orderId}`,
    });
    onOpenChange(false);
    setNewOrderData({
      orderId: "",
      awb: "",
      customerName: "",
      channel: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Enter the order details to generate a QR code for delivery verification.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderId" className="text-right">
              Order ID
            </Label>
            <Input
              id="orderId"
              name="orderId"
              className="col-span-3"
              value={newOrderData.orderId}
              onChange={handleNewOrderChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="awb" className="text-right">
              AWB Number
            </Label>
            <Input
              id="awb"
              name="awb"
              className="col-span-3"
              value={newOrderData.awb}
              onChange={handleNewOrderChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Customer
            </Label>
            <Input
              id="customerName"
              name="customerName"
              className="col-span-3"
              value={newOrderData.customerName}
              onChange={handleNewOrderChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel" className="text-right">
              Channel
            </Label>
            <Input
              id="channel"
              name="channel"
              placeholder="Amazon, Shopify, etc."
              className="col-span-3"
              value={newOrderData.channel}
              onChange={handleNewOrderChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleNewOrderSubmit}>Generate QR Code</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;

