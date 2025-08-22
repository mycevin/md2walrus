import { useState } from "react";
import { HelpCircle, Activity } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import { HelpModal } from "./index";
import { EnvironmentCheck } from "./index";
import NetworkStatus from "./NetworkStatus";
import "./Navbar.css";

const Navbar = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [showEnvironmentCheck, setShowEnvironmentCheck] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>MD2Walrus</h1>
        </div>

        <div className="navbar-actions">
          <NetworkStatus />

          <button
            className="navbar-button"
            onClick={() => setShowEnvironmentCheck(true)}
            title="环境检测"
          >
            <Activity size={20} />
          </button>

          <button
            className="navbar-button"
            onClick={() => setShowHelp(true)}
            title="帮助"
          >
            <HelpCircle size={20} />
          </button>

          <ConnectButton connectText="连接钱包" className="connect-button" />
        </div>
      </nav>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <EnvironmentCheck
        isOpen={showEnvironmentCheck}
        onClose={() => setShowEnvironmentCheck(false)}
      />
    </>
  );
};

export default Navbar;
