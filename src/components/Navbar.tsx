import { HelpCircle, List } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import NetworkStatus from "./NetworkStatus";
import "./Navbar.css";

interface NavbarProps {
  onHelpClick: () => void;
  onOpenBlobList?: () => void;
}

const Navbar = ({ onHelpClick, onOpenBlobList }: NavbarProps) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="logo">md2walrus</div>
      </div>
      <div className="navbar-right">
        <NetworkStatus />
        {onOpenBlobList && (
          <button
            className="navbar-button blob-list-button"
            onClick={onOpenBlobList}
            title="我的文档列表"
          >
            <List size={20} />
          </button>
        )}
        <button className="help-button" onClick={onHelpClick} title="Help">
          <HelpCircle size={20} />
        </button>
        <ConnectButton connectText="Connect Sui Wallet" />
      </div>
    </div>
  );
};

export default Navbar;
