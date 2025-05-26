'use client';

import Loading from '@/Components/Alert';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface VideoInfo {
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    channelId: string;
}

interface Prediction {
    emotion: string;
    confidence: string;
    probabilities: {
        Anger: string;
        Disgust: string;
        Enjoyment: string;
        Fear: string;
        Sadness: string;
        Surprise: string;
        Other: string;
    };
}

interface Comment {
    name: string;
    imgUrl: string;
    comment: string;
    likeCount: number;
    replyCount: number;
    prediction: Prediction;
}

interface AnalyzeResponse {
    video_info: VideoInfo;
    comments: Comment[];
}

export default function Home() {
    const { data: session } = useSession();
    const [videoUrl, setVideoUrl] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<
        'loading' | 'success' | 'error' | undefined
    >(undefined);
    const [dataRes, setDataRes] = useState<AnalyzeResponse>();
    const [avgEmotions, setAvgEmotions] = useState<Record<string, number>>({});
    const [highestEmotion, setHighestEmotion] = useState<string>('');

    const handleAnalyze = async () => {
        if (!session) {
            alert('Please sign in to try analyze');
            return;
        }

        if (!videoUrl) {
            alert('Please enter a YouTube video URL');
            return;
        }

        try {
            setStatus('loading');
            setMessage('Processing...');

            const res = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ link: videoUrl }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                setMessage('Error something while analyze processing!');
            } else {
                setStatus('success');
                setMessage('Success Analyze!');
                setDataRes(data);
                setVideoUrl('');
                handleAvgEmotion(data);
            }
        } catch {
            setStatus('error');
            setMessage('Error something while analyze processing!');
        }
    };

    const handleAvgEmotion = (data: AnalyzeResponse) => {
        if (!data?.comments || data.comments.length === 0) {
            setAvgEmotions({});
            setHighestEmotion('');
            return;
        }

        const emotions: (keyof Prediction['probabilities'])[] = [
            'Anger',
            'Disgust',
            'Enjoyment',
            'Fear',
            'Sadness',
            'Surprise',
            'Other',
        ];

        const sums: Record<string, number> = emotions.reduce(
            (acc, emotion) => ({ ...acc, [emotion]: 0 }),
            {}
        );
        const count = data.comments.length;

        // Sum probabilities for each emotion
        data.comments.forEach((comment) => {
            emotions.forEach((emotion) => {
                const prob =
                    parseFloat(comment.prediction.probabilities[emotion]) || 0;
                sums[emotion] += prob;
            });
        });

        // Calculate averages
        const averages: Record<string, number> = emotions.reduce(
            (acc, emotion) => ({
                ...acc,
                [emotion]: Number((sums[emotion] / count).toFixed(2)),
            }),
            {}
        );

        // Find the emotion with the highest average
        const highest = emotions.reduce((maxEmotion, emotion) =>
            averages[emotion] > averages[maxEmotion] ? emotion : maxEmotion
        );

        setAvgEmotions(averages);
        setHighestEmotion(highest);
    };

    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timeout = setTimeout(() => {
                setStatus(undefined);
                setMessage('');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [status]);

    return (
        <main className="w-[1350px] mx-auto my-10 p-5">
            {/* Alert */}
            {status && message && (
                <div className="flex flex-row items-center gap-4 absolute top-5 left-5 z-10">
                    <Loading message={message} status={status} />
                </div>
            )}

            {/* Session */}
            {session ? (
                <div className="flex flex-row items-center gap-4 absolute top-5 right-5">
                    <img
                        src={session.user?.image || '/default-avatar.png'}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full"
                    />
                    <p className="text-xl font-semibold">
                        {session.user?.name || 'User'}
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="cursor-pointer bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-300"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => signIn()}
                    className="absolute top-5 right-5 cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300"
                >
                    Sign In
                </button>
            )}

            <h1 className="text-4xl font-bold mb-8 text-center">
                Hi there! Welcome to Emotion Analysis
            </h1>

            <div className="flex flex-row gap-10 text-black w-full">
                {/* Left side: button fetch */}
                <div className="w-1/3 p-4 bg-[#cacbc6] shadow-lg rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                        Youtube Video Comment Sentiment Explorer
                    </h2>
                    <h3 className="text-xl font-medium mb-10 text-center">
                        By: Nguyễn Phúc Hậu
                    </h3>

                    <p className="text-xl font-semibold mb-5 text-center">
                        Paste Youtube Video URL
                    </p>
                    <div>
                        <input
                            type="text"
                            className="w-full p-2 border border-black rounded outline-none focus:border-blue-600"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />
                        <button
                            onClick={handleAnalyze}
                            className="mt-2 w-full bg-blue-500 text-white p-2.5 rounded hover:bg-blue-600 transition-colors duration-300 cursor-pointer"
                        >
                            Analyze
                        </button>
                    </div>
                </div>

                {/* Right side: render result analyze*/}
                <div className="w-2/3 p-6 bg-[#e6d3e4] shadow-lg rounded-lg">
                    {/* Last results and video info */}
                    <div className="flex flex-row gap-20 items-start">
                        <div className="w-[50%]">
                            <div className="flex flex-row items-center gap-4 mb-4 border border-black p-2 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-black"></div>
                                <p className="text-xl font-semibold">
                                    {dataRes
                                        ? dataRes.video_info.channelTitle
                                        : 'Channel Name'}
                                </p>
                            </div>

                            <img
                                src={dataRes?.video_info.thumbnailUrl}
                                alt="thumbnailChannel"
                                className="w-full h-auto mb-4 rounded-lg"
                                style={{
                                    maxHeight: '200px',
                                    objectFit: 'cover',
                                }}
                            />

                            <p className="text-xl font-semibold">
                                {dataRes
                                    ? dataRes.video_info.title
                                    : 'Title Video'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xl font-semibold">Result</p>

                            <div className="flex flex-col gap-2 mt-2">
                                {Object.entries(avgEmotions).map(
                                    ([emotion, percentage], idx) => (
                                        <div
                                            className="flex items-center gap-2 border border-black p-2 rounded-lg"
                                            key={idx}
                                        >
                                            <span
                                                className={`text-xl font-semibold ${
                                                    emotion === highestEmotion
                                                        ? 'text-green-500'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                {emotion}
                                            </span>
                                            <span className="text-gray-600">
                                                {percentage}%
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top 20 comments relevance */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-semibold mb-4">
                            {'-->'} Where the result comes from
                        </h2>
                        {dataRes?.comments.map((comment, idx) => (
                            <div className="mb-3" key={idx}>
                                <div className="w-full shadow-2xl border border-black rounded-lg p-4 mb-4">
                                    <div className="flex flex-row items-start gap-4">
                                        <img
                                            src={comment.imgUrl}
                                            alt="avatar"
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <h3>{comment.name}</h3>
                                            <h3 className="font-semibold">
                                                {comment.comment}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex flex-row items-center gap-4 mt-6 font-semibold">
                                        <p>
                                            Like:{' '}
                                            <span>{comment.likeCount}</span>
                                        </p>
                                        <p>
                                            Reply:{' '}
                                            <span>{comment.replyCount}</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-row gap-8 items-center mt-5">
                                        {Object.entries(
                                            comment.prediction.probabilities
                                        ).map(([emotion, percentage], idx) => (
                                            <div
                                                className="flex flex-col items-start gap-2"
                                                key={idx}
                                            >
                                                <p>{emotion}</p>
                                                <span
                                                    className={`rounded-lg py-2 px-4 text-white ${
                                                        emotion ===
                                                        comment.prediction
                                                            .emotion
                                                            ? 'bg-green-600 font-bold'
                                                            : 'bg-blue-600'
                                                    }`}
                                                >
                                                    {percentage}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
