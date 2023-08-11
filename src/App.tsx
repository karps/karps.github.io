import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clipboard } from "lucide-react";
import Settings from "@/components/Settings";
import { convertSecondsToTime, getCopyString } from "@/lib/utils";
import { DutyPart, duties } from "@/lib/constants";

import { worker_script } from "./worker-script.ts";
const worker = new Worker(worker_script);

const App = () => {
  const halfShift = parseInt(
    JSON.parse(localStorage.getItem("seconds") ?? "900")
  );

  const [duty, setDuty] = useState("");
  const [dutyPart, setDutyPart] = useState<DutyPart>(DutyPart.START);
  const [activeShift, setActiveShift] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(halfShift);
  const { seconds, minutes } = convertSecondsToTime(timeLeft);

  worker.onmessage = ({ data: { time } }) => {
    setTimeLeft(halfShift - (time % (halfShift + 1)));
  };

  const writeMessage = (message: string) => {
    const persist = JSON.parse(localStorage.getItem("message-log") ?? "true");

    if (JSON.parse(localStorage.getItem("auto-copy") ?? "false")) {
      navigator.clipboard.writeText(message);
    }

    if (persist) {
      setMessages((prevMessages) => [...prevMessages, message]);
    } else {
      setMessages([message]);
    }
  };

  useEffect(() => {
    if (!activeShift) return;
    if (timeLeft > 0) return;

    if (dutyPart === DutyPart.END) {
      if (JSON.parse(localStorage.getItem("continuous") ?? "false")) {
        writeMessage(getCopyString(dutyPart, duty));
      } else {
        setActiveShift(false);
        writeMessage(getCopyString(dutyPart, duty));
      }
      setDutyPart(DutyPart.START);
    }

    if (dutyPart === DutyPart.START) {
      writeMessage(getCopyString(DutyPart.MID, duty));
      setDutyPart(DutyPart.END);
      return;
    }
  }, [activeShift, timeLeft]);

  const toggleShift = () => {
    if (!worker) return;

    if (activeShift) {
      setActiveShift(false);
      worker.postMessage({ turn: "off" });
    } else {
      setActiveShift(true);
      writeMessage(getCopyString(dutyPart, duty));
      worker.postMessage({ turn: "on" });
      beep();
    }
  };

  const changeDuty = (d: string) => {
    const minutes = new Date().getMinutes().toString().padStart(2, "0");
    if (activeShift) {
      writeMessage(`${duty} > ${d} @ ${minutes}`);
    }

    setDuty(d);
  };

  const copyString = (message: string) => {
    const parts = message.split(":");
    const messageMinute = parseInt(parts[1].trim());
    const currentMinute = new Date().getMinutes();
    const difference = currentMinute - messageMinute;

    if (currentMinute > messageMinute) {
      navigator.clipboard.writeText(`${message} (OS by ${difference})`);
    } else {
      navigator.clipboard.writeText(message);
    }
  };

  return (
    <div className="flex flex-row gap-2 mt-4 justify-center">
      <section className="flex flex-col gap-4 max-w-screen-sm w-2/6 overflow-hidden">
        <Settings />
        <Select onValueChange={changeDuty}>
          <SelectTrigger>
            <SelectValue placeholder="Duty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Duties</SelectLabel>
              {duties.map((duty) => (
                <SelectItem value={duty.acr} key={duty.acr}>
                  {duty.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="secondary"
          onClick={toggleShift}
          disabled={duty === ""}
        >
          {duty === ""
            ? "Select a duty to start your shift"
            : activeShift
            ? "Stop shift"
            : "Start shift"}
        </Button>
        {activeShift &&
          `${minutes} minutes and ${seconds} seconds until next message`}
        {messages
          .slice(0)
          .reverse()
          .map((message, index) => (
            <div
              className="flex items-center justify-between p-2 mb-1 mt-1 overflow-x-auto rounded-lg border bg-slate-900 "
              key={index}
            >
              <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {message}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  copyString(message);
                }}
              >
                <Clipboard />
              </Button>
            </div>
          ))}
      </section>
    </div>
  );
};

export default App;

function beep() {
  var snd = new Audio(
    "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
  );
  snd.play();
}
