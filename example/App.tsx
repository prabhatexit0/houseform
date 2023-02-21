import { Field, Form } from "houseform";
import { FieldArray, FieldArrayItem } from "houseform"; 
import { useRef } from "react";
import { z } from "zod";

export default function App() {
  const test = useRef(null)
  const fieldItemsRef =  useRef<any[]>([])

  const handleSubmit = () => {
    console.log("FieldArray: ", test.current)
    console.log("Field Items: ", fieldItemsRef.current)
  }

  return (
    <Form
      onSubmit={(values) => {
        alert("Form was submitted with: " + JSON.stringify(values));
      }}
    >
      {() => (
        <>
          <FieldArray<{ name: string }>
            ref={test}
            name="people"
            initialValue={[{ name: "Corbin" }]}
          >
            {({ value, add }) => (
              <>
                {value.map((person, i) => (
                  <FieldArrayItem<string> name={`people[${i}].name`} key={i} ref={(element) => fieldItemsRef.current[i] = element}>
                    {({ value, setValue }) => {
                      return (
                        <input
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      );
                    }}
                  </FieldArrayItem>
                ))}
                <button onClick={() => add({ name: "Other" })}>Add</button>
              </>
            )}
          </FieldArray>
          <br/>
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </Form>
  )
}

function ExampleFeildForm() {
  return <div>
    <Form
      onSubmit={(values) => {
        alert("Form was submitted with: " + JSON.stringify(values));
      }}
    >
      {({ isValid, submit }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field
            name="email"
            onBlurValidate={z.string().email("This must be an email")}
            onSubmitValidate={isEmailUnique}
          >
            {({ value, setValue, onBlur, errors }) => {
              return (
                <div>
                  <input
                    value={value}
                    onBlur={onBlur}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={"Email"}
                  />
                  {errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              );
            }}
          </Field>
          <Field<string>
            name="password"
            onChangeValidate={z
              .string()
              .min(8, "Must be at least 8 characters long")}
          >
            {({ value, setValue, onBlur, errors }) => {
              return (
                <div>
                  <input
                    value={value}
                    onBlur={onBlur}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={"Password"}
                    type="password"
                  />
                  {errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              );
            }}
          </Field>
          <Field<string>
            name="confirmpassword"
            listenTo={["password"]}
            onChangeValidate={(val, form) => {
              if (val === form.getFieldValue("password")!.value) {
                return Promise.resolve(true);
              } else {
                return Promise.reject("Passwords must match");
              }
            }}
          >
            {({ value, setValue, onBlur, errors, isTouched }) => {
              return (
                <div>
                  <input
                    value={value}
                    onBlur={onBlur}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={"Password Confirmation"}
                    type="password"
                  />
                  {isTouched &&
                    errors.map((error) => <p key={error}>{error}</p>)}
                </div>
              );
            }}
          </Field>
          <button disabled={!isValid} type="submit">
            Submit
          </button>
        </form>
      )}
    </Form>
  </div>
}

function isEmailUnique(val: string) {
  return new Promise<boolean>((resolve, reject) => {
    setTimeout(() => {
      const isUnique = !val.startsWith("crutchcorn");
      if (isUnique) {
        resolve(true);
      } else {
        reject("That email is already taken");
      }
    }, 20);
  });
}
