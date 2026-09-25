import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTrip } from '../context/TripContext';
import { Button } from '../components/Button';
import GeneratingLoader from '../components/GeneratingLoader';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';


export const Generating: React.FC = () => {
  const navigate = useNavigate();
  const { lastRequest, generateTrip, currentPlan, isGenerating } = useTrip();

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasExecutedRef = useRef(false);
  const isRetryingRef = useRef(false);


  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Poll / check trip completion with strict single-execution guard (avoids React StrictMode double firing)
  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const execute = async () => {
      if (!lastRequest) {
        // If arrived without request, redirect back to plan
        if (!currentPlan) {
          navigate('/plan');
        } else {
          navigate('/result');
        }
        return;
      }

      try {
        const plan = await generateTrip(lastRequest);
        if (isMountedRef.current) {
          if (plan) {
            navigate('/result');
          } else {
            setHasError(true);
            setErrorMessage('AI route generation failed. Please try again with a different budget or city.');
          }
        }
      } catch (err: unknown) {
        if (isMountedRef.current) {
          setHasError(true);
          setErrorMessage(err instanceof Error ? err.message : 'Kuch gadbad ho gayi. Kripya punah prayas karein.');
        }
      }
    };

    execute();
  }, [lastRequest, generateTrip, navigate]);

  const handleRetry = async () => {
    if (isRetryingRef.current || isGenerating) return;
    isRetryingRef.current = true;
    setHasError(false);

    if (!lastRequest) {
      navigate('/plan');
      isRetryingRef.current = false;
      return;
    }

    try {
      const plan = await generateTrip(lastRequest);
      if (plan) {
        navigate('/result');
      } else {
        setHasError(true);
        setErrorMessage('AI route generation failed. Please try again with a different budget or city.');
      }
    } catch (err: unknown) {
      setHasError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Kuch gadbad ho gayi. Kripya punah prayas karein.');
    } finally {
      isRetryingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-[#fafafa] dark:bg-[#000000]">
      <div className="max-w-md w-full text-center">
        {!hasError ? (
          <GeneratingLoader title="Generating your trip…" />
        ) : (

          /* Error Card with Retry + Back Buttons as specified in PRD Section 5 F3 */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-6 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Route nahi ban paya
              </h3>
              <p className="text-[14px] text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                {errorMessage || 'Unable to generate route right now. Please check your network and try again.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="primary"
                onClick={handleRetry}
                className="gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/plan')}
                className="gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
