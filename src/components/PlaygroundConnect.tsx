import { CLOUD_ENABLED, CloudConnect } from "../cloud/CloudConnect";
import { Button } from "./button/Button";
import { useState } from "react";
import { TokenSource, TokenSourceConfigurable } from "livekit-client";
import { PlaygroundConnectProps } from "@/lib/types";

const ConnectTab = ({ active, onClick, children }: any) => {
  let className = "px-2 py-1 text-sm";

  if (active) {
    className += " border-b border-cyan-500 text-cyan-500";
  } else {
    className += " text-gray-500 border-b border-transparent";
  }

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};

const TokenConnect = ({
  accentColor,
  onConnectClicked,
}: PlaygroundConnectProps) => {
  const [url, setUrl] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [uid, setUid] = useState<string>(
    process.env.NEXT_PUBLIC_MEMORYLANE_UID || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCircularDevice, setIsCircularDevice] = useState(false);
  const [isPlayVoiceCue, setisPlayVoiceCue] = useState(true);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/connection-details", {
        method: "POST",
        headers: {
          accept: "application/json",
          "memorylane-uid": uid,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playVoiceCue: isPlayVoiceCue,
          isCircularDevice,
        }),
      });
      const data = await response.json();
      if (data.status === "success" && data.data) {
        setUrl(data.data.serverUrl);
        setToken(data.data.participantToken);
      } else {
        console.error("Failed to fetch credentials", data);
        alert("Failed to fetch credentials");
      }
    } catch (e) {
      console.error("Error fetching credentials", e);
      alert("Error fetching credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex left-0 top-0 w-full h-full bg-black/80 items-center justify-center text-center">
      <div className="flex flex-col gap-4 p-8 bg-gray-950 w-full text-white border-t border-gray-900">
        <div className="flex flex-col gap-2 mb-2 pb-4 border-b border-gray-900">
          <div className="text-left text-xs text-gray-500 uppercase font-semibold tracking-wider">
            Auto-Fill Credentials
          </div>
          <div className="flex gap-2">
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="text-white text-sm bg-transparent border border-gray-800 rounded-sm px-3 py-2 flex-grow pointer-events-auto"
              placeholder="MemoryLane UID"
            />
            <Button
              accentColor={accentColor}
              disabled={isLoading}
              onClick={() => {
                fetchCredentials();
              }}
              className="whitespace-nowrap z-10 cursor-pointer pointer-events-auto"
            >
              {isLoading ? "Fetching..." : "Fetch"}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="isCircularDevice"
              checked={isCircularDevice}
              onChange={(e) => setIsCircularDevice(e.target.checked)}
              className="w-4 h-4 bg-transparent border border-gray-800 rounded-sm cursor-pointer"
            />
            <label
              htmlFor="isCircularDevice"
              className="text-sm text-gray-400 cursor-pointer select-none"
            >
              Is Circular Device
            </label>
          </div>
            <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="isPlayVoiceCue"
              checked={isPlayVoiceCue}
              onChange={(e) => setisPlayVoiceCue(e.target.checked)}
              className="w-4 h-4 bg-transparent border border-gray-800 rounded-sm cursor-pointer"
            />
            <label
              htmlFor="isPlayVoiceCue"
              className="text-sm text-gray-400 cursor-pointer select-none"
            >
              Play Voice Cue
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-white text-sm bg-transparent border border-gray-800 rounded-sm px-3 py-2"
            placeholder="wss://url"
          ></input>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="text-white text-sm bg-transparent border border-gray-800 rounded-sm px-3 py-2"
            placeholder="room token..."
          ></textarea>
        </div>
        <Button
          accentColor={accentColor}
          className="w-full"
          onClick={() => {
            const source = TokenSource.literal({
              serverUrl: url,
              participantToken: token,
            });
            onConnectClicked(source, true);
          }}
        >
          Connect
        </Button>
        <a
          href="https://livekit.io/"
          className={`text-xs text-${accentColor}-500 hover:underline`}
        >
          Don’t have a URL or token? Try the demo agent!
        </a>
      </div>
    </div>
  );
};

export const PlaygroundConnect = ({
  accentColor,
  onConnectClicked,
}: PlaygroundConnectProps) => {
  const [showCloud, setShowCloud] = useState(false);
  const copy = CLOUD_ENABLED
    ? "Connect to playground with LiveKit Cloud or manually with a URL and token"
    : "Connect to playground with a URL and token";
  return (
    <div className="flex left-0 top-0 w-full h-full bg-black/80 items-center justify-center text-center gap-2">
      <div className="min-h-[540px]">
        <div className="flex flex-col bg-gray-950 w-full max-w-[480px] rounded-lg text-white border border-gray-900">
          <div className="flex flex-col gap-2">
            <div className="px-10 space-y-2 py-6">
              <h1 className="text-2xl">Connect to playground</h1>
              <p className="text-sm text-gray-500">{copy}</p>
            </div>
            {CLOUD_ENABLED && (
              <div className="flex justify-center pt-2 gap-4 border-b border-t border-gray-900">
                <ConnectTab
                  active={showCloud}
                  onClick={() => {
                    setShowCloud(true);
                  }}
                >
                  LiveKit Cloud
                </ConnectTab>
                <ConnectTab
                  active={!showCloud}
                  onClick={() => {
                    setShowCloud(false);
                  }}
                >
                  Manual
                </ConnectTab>
              </div>
            )}
          </div>
          <div className="flex flex-col bg-gray-900/30 flex-grow">
            {showCloud && CLOUD_ENABLED ? (
              <CloudConnect
                accentColor={accentColor}
                onConnectClicked={onConnectClicked}
              />
            ) : (
              <TokenConnect
                accentColor={accentColor}
                onConnectClicked={onConnectClicked}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
