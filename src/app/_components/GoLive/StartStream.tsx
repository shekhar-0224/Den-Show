"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { uploadFile } from "~/lib/utils";
import { api } from "~/trpc/react";

interface StartStreamProps {
  onStartStream: () => void;
}

const StartStream = ({ onStartStream }: StartStreamProps) => {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    streamTitle: string;
    thumbnail: File | null;
    description: string;
    fansOnly: boolean;
    audioOnly: boolean;
    clippingAllowed: boolean;
    tags: string;
  }>({
    streamTitle: "",
    thumbnail: null,
    description: "",
    fansOnly: false,
    audioOnly: false,
    clippingAllowed: false,
    tags: "",
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduledPopup, setShowScheduledPopup] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState({ hour: 7, minute: 0, period: 'AM' });

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setScheduleData({
      ...scheduleData,
      date: formatDate(date),
    });
    setShowDatePicker(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleTimeSelect = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setSelectedTime({ hour, minute, period });
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}${period}`;
    setScheduleData({
      ...scheduleData,
      time: formattedTime,
    });
    setShowTimePicker(false);
  };

  const { mutateAsync: startStream } = api.stream.startInstant.useMutation({
    onSuccess: (data) => {
      setIsStartingStream(false);
      toast.success("Stream started successfully");
      onStartStream();
      router.push(`/live/${data.streamId}/dashboard`);
    },
    onError: () => {
      setIsStartingStream(false);
      toast.error("Failed to start stream");
    },
  });

  const [isStartingStream, setIsStartingStream] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, thumbnail: file });
  };

  const startLivestreamHandler = async (
    e?: React.FormEvent<HTMLFormElement>,
  ) => {
    if (e) {
    e.preventDefault();
    }

    setIsStartingStream(true);

    let thumbnailUrl: string | undefined = undefined;

    if (formData.thumbnail) {
      thumbnailUrl = await uploadFile(formData.thumbnail);
    }

    await startStream({
      title: formData.streamTitle,
      description: formData.description,
      categories: [],
      accessType: formData.fansOnly ? "Fan Only" : "Open to All",
      thumbnailUrl,
      clippingAllowed: formData.clippingAllowed,
    });
  };

  const isButtonDisabled =
    !formData.streamTitle || !formData.description || isStartingStream;
  const isScheduleButtonDisabled = isButtonDisabled || !scheduleData.date || !scheduleData.time;

  return (
    <div className="p-4">
      {!showScheduledPopup && (
        <>
      <div className="text-lg font-cream-medium">Go Live</div>
      <form
        className="mt-6 flex flex-col gap-8"
        onSubmit={startLivestreamHandler}
      >
        <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="channel-name">
            Stream Title
          </label>
          <Input
            id="channel-name"
            placeholder="Enter title here"
            className="text-sm py-6 shadow-small"
            value={formData.streamTitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                streamTitle: e.target.value,
              })
            }
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[229px] flex flex-col gap-2">
            <label className="uppercase text-xs" htmlFor="thumbnail">
              Thumbnail
            </label>
            {formData.thumbnail ? (
              <Image
                src={URL.createObjectURL(formData.thumbnail)}
                alt="Thumbnail"
                width={229}
                height={100}
                className="object-cover cursor-pointer h-fit w-full aspect-auto"
                onClick={() =>
                  document.getElementById("thumbnail-input")?.click()
                }
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                onClick={() =>
                  document.getElementById("thumbnail-input")?.click()
                }
                className="text-sm font-normal underline underline-offset-2 border-2 border-dashed border-border rounded-md p-4 flex items-center justify-center cursor-pointer w-full h-[100px]"
              >
                Choose Thumbnail
              </div>
            )}
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="uppercase text-xs" htmlFor="stream-desc">
              Description (if any)
            </label>
            <Textarea
              id="stream-desc"
              className="text-sm h-[100px]"
              placeholder="Write about your stream here"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="tags">
            Tags
          </label>
          <div className="relative w-[229px]">
            <Input
              id="tags"
              placeholder="Choose Tags"
              className="text-sm py-6 pr-10 w-full"
              value={formData.tags}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value,
                })
              }
            />
            <Image
              src="/icons/chevron-right.svg"
              alt="Dropdown"
              width={9}
              height={14}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90"
            />
          </div>
        </div>

        <div className="flex items-center gap-18">
        <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="channel-name">
            Audience
          </label>
            <div className="flex items-center space-x-3">
              <Switch
                id="fans-only"
                checked={formData.fansOnly}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    fansOnly: checked,
                  })
                }
              />
              <Label htmlFor="fans-only" className="font-normal text-sm">
                Open to <span className="font-semibold">FANS</span> only
              </Label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="uppercase text-xs" htmlFor="channel-name">
              Clipping
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Image
                  src="/icons/info.svg"
                  alt="Info"
                  width={16}
                  height={16}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Only fans will be allowed to clip your content</p>
              </TooltipContent>
            </Tooltip>
          </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="clipping-allowed"
                checked={formData.clippingAllowed}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    clippingAllowed: checked,
                  })
                }
              />
              <Label htmlFor="clipping-allowed" className="font-normal text-sm">
                Allow <span className="font-semibold">CLIPPING</span>
              </Label>
            </div>
          </div>
        </div>

        {/* <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="audio-only">
            Audio-Only Mode
          </label>
          <div className="flex items-center space-x-2">
            <Switch
              id="audio-only"
              checked={formData.audioOnly}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  audioOnly: checked,
                })
              }
            />
            <Label htmlFor="audio-only" className="font-normal text-sm">
              {formData.audioOnly ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div> */}

        {!isScheduling ? (
          <div className="flex items-center justify-center gap-4">
            <Button disabled={isButtonDisabled} className="w-[238px] px-8" type="submit">
            {isStartingStream ? "Starting..." : "Go Live Now"}
          </Button>
            <span className="text-xs text-[#454343]">
              or <span 
                className="underline font-cream-medium cursor-pointer"
                onClick={() => setIsScheduling(true)}
              >
            Schedule for Later
              </span>
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-sm font-cream-regular">Schedule for Later</div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="uppercase text-xs" htmlFor="schedule-date">
                  Enter Date
                </label>
                <div className="relative">
                  <Input
                    id="schedule-date"
                    placeholder="DD/MM/YYYY"
                    className="text-sm py-6 pr-10 w-full shadow-small"
                    value={scheduleData.date}
                    readOnly
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  />
                  <Image
                    src="/icons/calendar.svg"
                    alt="Calendar"
                    width={16}
                    height={16}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  />
                  
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-large z-50 w-64 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigateMonth('prev')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ‹
                        </button>
                        <span className="font-medium">
                          {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => navigateMonth('next')}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ›
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                          <div key={day} className="text-xs font-medium text-center py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((day, index) => (
                          <div key={index} className="text-center">
                            {day ? (
                              <button
                                onClick={() => handleDateSelect(day)}
                                className={`w-8 h-8 text-sm rounded hover:bg-gray-100 ${
                                  selectedDate && day.getTime() === selectedDate.getTime()
                                    ? 'bg-black text-white'
                                    : 'text-gray-700'
                                }`}
                              >
                                {day.getDate()}
                              </button>
                            ) : (
                              <div className="w-8 h-8" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <label className="uppercase text-xs" htmlFor="schedule-time">
                  Time
                </label>
                <div className="relative">
                  <Input
                    id="schedule-time"
                    placeholder="HH:MM"
                    className="text-sm py-6 pr-10 w-full shadow-small"
                    value={scheduleData.time}
                    onChange={(e) => {
                      const value = e.target.value;
                      const timeWithPeriod = value + selectedTime.period;
                      setScheduleData({
                        ...scheduleData,
                        time: timeWithPeriod,
                      });
                      // Parse the time and update selectedTime
                      const timeMatch = value.match(/^(\d{1,2}):(\d{2})$/);
                      if (timeMatch) {
                        const hour = parseInt(timeMatch[1]);
                        const minute = parseInt(timeMatch[2]);
                        if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
                          setSelectedTime({
                            hour: hour,
                            minute: minute,
                            period: selectedTime.period
                          });
                        }
                      }
                    }}
                    onFocus={() => setShowTimePicker(true)}
                  />
                  <Image
                    src="/icons/clock.svg"
                    alt="Clock"
                    width={16}
                    height={16}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                  />
                  
                  {showTimePicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-large z-50 w-full p-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className="text-3xl font-bold">
                          <span className="underline">{selectedTime.hour.toString().padStart(2, '0')}</span>
                          <span className="mx-2">:</span>
                          <span>{selectedTime.minute.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex flex-col gap-1 ml-4">
                          <button
                            onClick={() => handleTimeSelect(selectedTime.hour, selectedTime.minute, 'AM')}
                            className={`px-3 py-1 text-sm rounded ${
                              selectedTime.period === 'AM' 
                                ? 'bg-black text-white' 
                                : 'text-black hover:bg-gray-100'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            onClick={() => handleTimeSelect(selectedTime.hour, selectedTime.minute, 'PM')}
                            className={`px-3 py-1 text-sm rounded ${
                              selectedTime.period === 'PM' 
                                ? 'bg-black text-white' 
                                : 'text-black hover:bg-gray-100'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center">
                        The time is in your local timezone
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span 
                className="text-sm text-[#454343] underline font-cream-medium cursor-pointer"
                onClick={() => setIsScheduling(false)}
              >
                or Go Live Now
              </span>
              <div className="flex justify-center">
                <Button 
                  disabled={isScheduleButtonDisabled} 
                  className="w-[238px] px-8" 
                  type="button"
                  onClick={() => {
                    setShowScheduledPopup(true);
                  }}
                >
                  {isStartingStream ? "Scheduling..." : "Schedule Now"}
                </Button>
              </div>
            </div>
        </div>
        )}
      </form>
        </>
      )}

      {/* Scheduled Stream Verification Popup */}
      {showScheduledPopup && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          {/* White Box - 612x434 */}
          <div className="bg-white rounded-lg w-[774px] h-[504px] p-2 animate-in zoom-in-95 duration-500">
            {/* Black Box - 598x338 aligned to top with equal padding */}
            <div className="bg-black w-[760px] h-[398px] rounded-none p-8">
              <div className="flex gap-12 h-full">
                {/* Left Div - Content */}
                <div className="flex-1 flex flex-col gap-6">
                  {/* Logo */}
                  <div className="flex items-center">
                    <Image
                      src="/images/logowhite.svg"
                      alt="Den Logo"
                      width={140}
                      height={60}
                      className="bg-black p-2 rounded"
                    />
                  </div>

                  {/* Content Group */}
                  <div className="flex flex-col gap-1">
                    {/* Date and Time in Red Box */}
                    <div className="bg-[#C34144] text-white px-3 py-1 rounded text-xs font-medium w-fit">
                      {scheduleData.date} at {scheduleData.time}
                    </div>
                    {/* Stream Title */}
                    <div className="text-[32px] font-cream-medium text-white">
                      Catchup with {formData.streamTitle || "Channel Name"}
                    </div>
                    <div className="text-[17px] font-cream-medium text-white">
                      @channel_name
                    </div>
                    <div className="text-[15px] font-cream-regular text-white">
                      Ticker: Bwayne
                    </div>
                  </div>

                  {/* Channel Link Box with Icon */}
                  <div className="flex flex-row items-center gap-2">
                    <div className="bg-white rounded-[30px] px-2 py-1 text-center w-fit">
                      <span className="text-black text-xs font-cream-medium">
                        den.show/channel_link
                      </span>
                    </div>
                    <Image
                      src="/images/small-icon.png"
                      alt="Small Icon"
                      width={55}
                      height={55}
                      className="w-10 h-10"
                    />
                  </div>
                </div>

                {/* Right Div - Image */}
                <div className="flex-1">
                  <Image
                    src="/images/scheduledstream.png"
                    alt="Scheduled Stream"
                    width={280}
                    height={271}
                    className="w-full h-auto object-cover rounded"
                  />
                </div>
              </div>
            </div>

            {/* 5 Buttons Below Black Box */}
            <div className="flex items-center justify-between p-4 mt-2 rounded">
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowScheduledPopup(false);
                    setIsScheduling(false);
                  }}
                  className="bg-white border-2 border-black text-black hover:bg-gray-100 px-6 py-2 shadow-[0_4px_0_0_rgba(0,0,0,1)]"
                >
                  Edit
                </Button>
                <Button
                  onClick={startLivestreamHandler}
                  className="bg-white border-2 border-black text-black hover:bg-gray-100 px-6 py-2 shadow-[0_4px_0_0_rgba(0,0,0,1)]"
                >
                  Go Live
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-black font-medium">Share via</span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                    <span className="text-black text-sm font-bold">X</span>
                  </div>
                  <div className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                    <span className="text-black text-sm font-bold">↗</span>
                  </div>
                  <div className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                    <span className="text-black text-sm font-bold">📁</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartStream;
