import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const Settings = () => {
  const [messageLog, setMessageLog] = useState(true);
  const [continuous, setContinuous] = useState(false);
  const [seconds, setSeconds] = useState(900);
  const [header, setHeader] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("message-log")) {
      localStorage.setItem("message-log", JSON.stringify(true));
    }

    if (!localStorage.getItem("continuous")) {
      localStorage.setItem("continuous", JSON.stringify(false));
    }

    if (!localStorage.getItem("seconds")) {
      localStorage.setItem("seconds", JSON.stringify(900));
    }

    if (!localStorage.getItem("header")) {
      localStorage.setItem("header", JSON.stringify(false));
    }

    if (!localStorage.getItem("auto-copy")) {
      localStorage.setItem("auto-copy", JSON.stringify(false));
    }

    setMessageLog(JSON.parse(localStorage.getItem("message-log") ?? "true"));
    setContinuous(JSON.parse(localStorage.getItem("continuous") ?? "false"));
    setSeconds(JSON.parse(localStorage.getItem("seconds") ?? "900"));
    setHeader(JSON.parse(localStorage.getItem("header") ?? "false"));
    setHeader(JSON.parse(localStorage.getItem("auto-copy") ?? "false"));
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="continuous-mode"
                    checked={continuous}
                    onCheckedChange={(checked) => {
                      setContinuous(checked);
                      localStorage.setItem(
                        "continuous",
                        JSON.stringify(checked)
                      );
                    }}
                  />
                  <Label htmlFor="continuous-mode">Continuous mode</Label>
                </div>
                If enabled, a new shift will start when another ends, and the
                message is changed accordingly.
              </div>
              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="message-log"
                    checked={messageLog}
                    onCheckedChange={(checked) => {
                      setMessageLog(checked);
                      localStorage.setItem(
                        "message-log",
                        JSON.stringify(checked)
                      );
                    }}
                  />
                  <Label htmlFor="message-log">Persist message log</Label>
                </div>
                If disabled, messages will be replaced when created, and only
                the latest message will be shown.
              </div>
              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="header"
                    checked={header}
                    onCheckedChange={(checked) => {
                      setHeader(checked);
                      localStorage.setItem("header", JSON.stringify(checked));
                    }}
                  />
                  <Label htmlFor="header">Show timer in tab title</Label>
                </div>
                If enabled, the timer will be shown in the page title.
              </div>
              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-copy"
                    checked={autoCopy}
                    onCheckedChange={(checked) => {
                      setAutoCopy(checked);
                      localStorage.setItem(
                        "auto-copy",
                        JSON.stringify(checked)
                      );
                    }}
                  />
                  <Label htmlFor="header">Auto-copy messages</Label>
                </div>
                If enabled, message text will be automatically copied to your
                clipboard. This only works if the window is focused when the
                message is written.
              </div>

              <Separator orientation="horizontal" />
              <div className="flex flex-col gap-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="seconds">Half shift length (seconds)</Label>
                  <Input
                    id="seconds"
                    type="number"
                    placeholder={seconds.toString()}
                    onChange={(e) => {
                      setSeconds(parseInt(e.target.value));
                      localStorage.setItem(
                        "seconds",
                        JSON.stringify(parseInt(e.target.value))
                      );
                    }}
                  />
                </div>
                The amount of time, in seconds, that should pass between
                messages (15 minutes = 900 seconds)
              </div>
              <SheetClose asChild></SheetClose>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
