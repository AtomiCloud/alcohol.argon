import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ValidationErrorContext } from '@/problems';
import { Problem, ProblemRegistry } from '@/lib/problem/core';
import type { ResultSerial } from '@/lib/monads/result';
import { Err, Ok } from '@/lib/monads/result';
import { PROBLEM_DEFINITIONS } from '@/problems/registry';
import { useCommonConfig } from '@/adapters/external/Provider';

export default function ProblemDemoPage() {
  const commonConfig = useCommonConfig();
  const problemRegistry = new ProblemRegistry(commonConfig.errorPortal, PROBLEM_DEFINITIONS);

  const [email, setEmail] = useState('');
  const [resultSerial, setResultSerial] = useState<ResultSerial<string, Problem> | ''>('');

  const validateEmail = async () => {
    if (!email) {
      const problem = problemRegistry.createProblem('validation_error', {
        field: 'email',
        value: email,
        constraint: 'Email is required',
        code: 'required',
      });
      const result = Err<string, Problem>(problem);
      setResultSerial(await result.serial());
      return;
    }

    if (!email.includes('@')) {
      const problem = problemRegistry.createProblem('validation_error', {
        field: 'email',
        value: email,
        constraint: 'Email must contain @ symbol',
        code: 'invalid_format',
      });
      const result = Err<string, Problem & ValidationErrorContext>(problem);
      setResultSerial(await result.serial());
      return;
    }

    const result = Ok<string, Problem & ValidationErrorContext>('Email is valid!');
    setResultSerial(await result.serial());
  };

  const resetForm = () => {
    setEmail('');
    setResultSerial('');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Problem Details Demo</h1>
        <p className="text-gray-600">
          Demonstrates RFC 7807 Problem Details with strongly typed registry and ResultSerial format.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Validation</CardTitle>
          <CardDescription>Enter an email to see how problems are created and serialized.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={validateEmail}>Validate</Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>

          {resultSerial && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">ResultSerial Format:</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(resultSerial, null, 2)}
              </pre>

              {resultSerial[0] === 'ok' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
                  ✅ {resultSerial[1]}
                </div>
              )}

              {resultSerial[0] === 'err' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                  ❌ {resultSerial[1].title}: {resultSerial[1].detail}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
