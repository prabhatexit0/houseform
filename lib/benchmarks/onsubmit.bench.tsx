import { describe, bench } from "vitest";

import { Field, Form } from "houseform";
import { useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Formik, Field as FormikField } from "formik";
import { Controller, useForm } from "react-hook-form";

const arr = Array.from({ length: 1000 }, (_, i) => i);

function HouseFormOnSubmitBenchmark() {
  const [val, setVal] = useState<Record<string, any> | null>(null);

  if (val) {
    return (
      <p>
        <span>Value:</span>
        {JSON.stringify(val)}
      </p>
    );
  }

  return (
    <Form<{ num: number[] }>
      onSubmit={(values) => {
        setVal(values);
      }}
    >
      {({ submit }) => (
        <>
          <button onClick={submit}>Submit</button>

          {arr.map((num, i) => {
            return (
              <Field key={i} name={`num[${i}]`} initialValue={num}>
                {() => {
                  return <></>;
                }}
              </Field>
            );
          })}
        </>
      )}
    </Form>
  );
}

function FormikOnSubmitBenchmark() {
  const [val, setVal] = useState<Record<string, any> | null>(null);

  if (val) {
    return (
      <p>
        <span>Value:</span>
        {JSON.stringify(val)}
      </p>
    );
  }

  return (
    <Formik
      initialValues={{
        num: arr,
      }}
      onSubmit={(values) => {
        setVal(values);
      }}
    >
      {({ submitForm }) => (
        <>
          <button onClick={submitForm}>Submit</button>
          {arr.map((num, i) => (
            <FormikField key={i} name={`num[${i}]`}>
              {() => {
                return <></>;
              }}
            </FormikField>
          ))}
        </>
      )}
    </Formik>
  );
}

function ReactHookFormOnSubmitBenchmark() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      num: arr,
    },
  });

  const [val, setVal] = useState<Record<string, any> | null>(null);

  if (val) {
    return (
      <p>
        <span>Value:</span>
        {JSON.stringify(val)}
      </p>
    );
  }

  return (
    <>
      <button onClick={handleSubmit((data) => setVal(data))}>Submit</button>

      {arr.map((num, i) => {
        return (
          <Controller
            key={i}
            control={control}
            render={({ field: { value } }) => <p>{value}</p>}
            name={`num.${i}`}
          />
        );
      })}
    </>
  );
}

describe("Submits 1,000 form items", () => {
  bench("HouseForm", async () => {
    cleanup();

    const { getByText, findByText } = render(<HouseFormOnSubmitBenchmark />);

    fireEvent.click(getByText("Submit"));

    await findByText("Value:");
  });

  bench("Formik", async () => {
    cleanup();

    const { getByText, findByText } = render(<FormikOnSubmitBenchmark />);

    fireEvent.click(getByText("Submit"));

    await findByText("Value:");
  });

  bench("React Hook Form", async () => {
    cleanup();

    const { getByText, findByText } = render(
      <ReactHookFormOnSubmitBenchmark />
    );

    fireEvent.click(getByText("Submit"));

    await findByText("Value:");
  });
});
