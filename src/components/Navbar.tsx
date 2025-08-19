import { HelpCircle } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import NetworkStatus from "./NetworkStatus";
import "./Navbar.css";

interface NavbarProps {
  onHelpClick: () => void;
}

const Navbar = ({ onHelpClick }: NavbarProps) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="logo">md2walrus</div>
      </div>
      <div className="navbar-right">
        <NetworkStatus />
        <button className="help-button" onClick={onHelpClick} title="Help">
          <HelpCircle size={20} />
        </button>
        <ConnectButton connectText="Connect Sui Wallet" />
      </div>
    </div>
  );
};

export default Navbar;
