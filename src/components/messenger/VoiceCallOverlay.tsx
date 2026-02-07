"use client";
import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, AlertCircle } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface VoiceCallOverlayProps {
    targetUser: any;
    isIncoming?: boolean;
    remoteOffer?: any;
    onEnd: () => void;
}

export default function VoiceCallOverlay({ targetUser, isIncoming = false, remoteOffer, onEnd }: VoiceCallOverlayProps) {
    const [status, setStatus] = useState(isIncoming ? "incoming" : "calling");
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [callTime, setCallTime] = useState(0);
    const { socket } = useSocket();
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    };

    // Format call time (00:00)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (status === "connected") {
            timerRef.current = setInterval(() => {
                setCallTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const setupWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            localStreamRef.current = stream;
            setStatus(isIncoming ? "connected" : "calling");

            peerConnectionRef.current = new RTCPeerConnection(configuration);
            stream.getTracks().forEach(track => {
                peerConnectionRef.current?.addTrack(track, stream);
            });

            peerConnectionRef.current.ontrack = (event) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            };

            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket?.emit('voiceCallIceCandidate', {
                        targetUserId: targetUser.userId || targetUser.user_id,
                        candidate: event.candidate,
                    });
                }
            };
        } catch (error: any) {
            console.error("WebRTC setup failed:", error);
            setError(error.message || "Unable to access microphone");
            setTimeout(onEnd, 3000);
        }
    };

    useEffect(() => {
        if (!isIncoming) {
            setupWebRTC().then(() => {
                if (!error && peerConnectionRef.current) {
                    peerConnectionRef.current.createOffer().then(offer => {
                        peerConnectionRef.current?.setLocalDescription(offer);
                        socket?.emit('voiceCallOffer', {
                            targetUserId: targetUser.userId || targetUser.user_id,
                            offer,
                        });
                    }).catch(err => {
                        console.error("Failed to create offer:", err);
                        setError("Failed to initiate call");
                        setTimeout(onEnd, 3000);
                    });
                }
            });
        }

        if (socket) {
            socket.on('voiceCallAnswered', async (data: any) => {
                setStatus("connected");
                await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
            });

            socket.on('voiceCallIceCandidate', async (data: any) => {
                await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
            });

            socket.on('voiceCallRejected', () => {
                setStatus("rejected");
                setTimeout(onEnd, 2000);
            });

            socket.on('voiceCallEnded', () => {
                onEnd();
            });
        }

        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            peerConnectionRef.current?.close();
            socket?.off('voiceCallAnswered');
            socket?.off('voiceCallIceCandidate');
            socket?.off('voiceCallRejected');
            socket?.off('voiceCallEnded');
        };
    }, [socket, targetUser.userId, targetUser.user_id, isIncoming]);

    const handleAccept = async () => {
        if (!remoteOffer) return;
        await setupWebRTC();
        setStatus("connecting");
        try {
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(remoteOffer));
            const answer = await peerConnectionRef.current?.createAnswer();
            await peerConnectionRef.current?.setLocalDescription(answer);
            socket?.emit('voiceCallAnswer', { targetUserId: targetUser.userId || targetUser.user_id, answer });
            setStatus("connected");
        } catch (error) {
            console.error("Failed to accept call:", error);
            onEnd();
        }
    };

    const handleReject = () => {
        socket?.emit('voiceCallReject', { targetUserId: targetUser.userId || targetUser.user_id });
        onEnd();
    };

    const handleEnd = () => {
        socket?.emit('voiceCallEnd', { targetUserId: targetUser.userId || targetUser.user_id });
        onEnd();
    };

    const avatar = targetUser.avatarUrl || targetUser.avatar_url;
    const name = targetUser.displayName || targetUser.display_name || targetUser.username;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between py-24 px-6 text-white overflow-hidden">
            {/* Background Aesthetic Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="flex flex-col items-center relative z-10 w-full max-w-sm mx-auto">
                <div className="relative group mb-10">
                    <div className="w-40 h-40 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-pink-500 animate-spin-slow">
                        <div className="w-full h-full rounded-full border-[6px] border-black overflow-hidden bg-zinc-900 flex items-center justify-center">
                            {avatar ? (
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <User className="w-20 h-20 text-purple-400/50" />
                            )}
                        </div>
                    </div>
                    {status === "connected" && (
                        <div className="absolute -inset-4 border-2 border-purple-500/30 rounded-full animate-ping pointer-events-none" />
                    )}
                </div>

                <h2 className="text-3xl font-black text-white tracking-tight mb-2 text-center">{name}</h2>
                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-purple-400 font-bold uppercase tracking-[0.2em] text-[11px]">
                        {error ? "Call Failed" :
                            status === "calling" ? "Calling..." :
                                status === "incoming" ? "Incoming Voice Call" :
                                    status === "connected" ? "Connected" :
                                        status === "connecting" ? "Establishing..." : status}
                    </span>
                    {status === "connected" && (
                        <span className="text-zinc-500 font-mono text-lg tracking-widest leading-none">
                            {formatTime(callTime)}
                        </span>
                    )}
                </div>

                {error && (
                    <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-red-500 font-bold text-sm">Microphone Error</p>
                            <p className="text-zinc-400 text-xs leading-relaxed">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            <audio ref={remoteAudioRef} autoPlay />

            <div className="flex items-center gap-10 relative z-10">
                {error ? (
                    <button
                        onClick={onEnd}
                        className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all shadow-2xl shadow-red-600/40 active:scale-90 group"
                    >
                        <PhoneOff className="w-9 h-9 text-white group-hover:rotate-12 transition-transform" />
                    </button>
                ) : status === "incoming" ? (
                    <>
                        <button
                            onClick={handleReject}
                            className="w-20 h-20 bg-zinc-900 border border-zinc-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 group"
                        >
                            <PhoneOff className="w-9 h-9 text-red-500 group-hover:text-white transition-colors" />
                        </button>
                        <button
                            onClick={handleAccept}
                            className="w-20 h-20 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all shadow-2xl shadow-green-600/40 animate-bounce active:scale-90 group"
                        >
                            <Phone className="w-9 h-9 text-white group-hover:rotate-12 transition-transform" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => {
                                if (localStreamRef.current) {
                                    const audioTracks = localStreamRef.current.getAudioTracks();
                                    audioTracks.forEach(track => {
                                        track.enabled = isMuted;
                                    });
                                    setIsMuted(!isMuted);
                                }
                            }}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${isMuted ? 'bg-red-600 border-red-500' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'} active:scale-90`}
                            disabled={!localStreamRef.current}
                        >
                            {isMuted ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-zinc-400" />}
                        </button>
                        <button
                            onClick={handleEnd}
                            className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all shadow-2xl shadow-red-600/40 active:scale-90 group"
                        >
                            <PhoneOff className="w-9 h-9 text-white group-hover:rotate-12 transition-transform" />
                        </button>
                        <button className="w-16 h-16 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full flex items-center justify-center transition-all active:scale-90">
                            <Volume2 className="w-7 h-7 text-zinc-400" />
                        </button>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
}
