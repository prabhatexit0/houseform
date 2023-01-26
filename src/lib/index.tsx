import {createContext, PropsWithChildren, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState} from "react";
import {ZodError, ZodTypeAny} from "zod";

function validate<T>(val: T, validator: ZodTypeAny | ((val: T) => Promise<boolean>)) {
    if (validator instanceof Function) {
        return validator(val);
    } else {
        return validator.parseAsync(val);
    }
}

// TODO: Add a `getValidationError`
// if (error instanceof ZodError) {
//     formField.setErrors(error.errors.map(error => error.message));
// } else {
//     formField.setErrors([error]);
// }


const FormContext = createContext({
    formFieldsRef: {current: [] as FieldProps[]},
    onSubmit: async () => {
        return undefined as void;
    }
});

interface FormProps<T> {
    onSubmit: (values: Record<string, T>) => void;
}

export function Form<T>(props: PropsWithChildren<FormProps<T>>) {
    const formFieldsRef = useRef<FieldProps[]>([]);

    const onSubmit = useCallback(async () => {
        let values = {} as Record<string, T>;

        const validArrays = await Promise.all(formFieldsRef.current.map(async formField => {
            if (formField.props.onSubmitValidate) {
                try {
                    await validate(formField.value, formField.props.onSubmitValidate);
                } catch (error) {
                    if (error instanceof ZodError) {
                        formField.setErrors(error.errors.map(error => error.message));
                    } else {
                        formField.setErrors([error as string]);
                    }
                    return false;
                }
            }
            if (formField.errors.length > 0) return false;
            values[formField.props.name] = formField.value;
            return true;
        }));

        if (!validArrays.every(isValid => !!isValid)) return;

        props.onSubmit(values);
    }, [formFieldsRef, props.onSubmit]);

    const value = useMemo(() => {
        return {formFieldsRef, onSubmit};
    }, [formFieldsRef, onSubmit]);

    return <FormContext.Provider value={value}>{props.children}</FormContext.Provider>
}

interface FieldBase<T = any> {
    name: string;
    onChangeValidate?: ZodTypeAny | ((val: T) => Promise<boolean>);
    onSubmitValidate?: ZodTypeAny | ((val: T) => Promise<boolean>);
}

interface FieldProps<T = any> {
    value: T;
    props: FieldBase<T>;
    setErrors: (error: string[]) => void;
    errors: string[];
}

interface FieldRenderProps<T = any> extends FieldBase<T> {
    // TODO: Pass `isValid`, pass `isTouched`, pass `isDirty`
    children: (props: {
        value: T,
        onChange: (val: T) => void,
        errors: string[]
    }) => JSX.Element;
    initialValue?: T;
}

export function Field<T>(props: FieldRenderProps<T>) {
    const {formFieldsRef} = useContext(FormContext);

    const [value, setValue] = useState<T>(props.initialValue ?? "" as T);
    const [errors, setErrors] = useState<string[]>([]);

    const onChange = (val: T) => {
        setValue(val);
        if (props.onChangeValidate) {
            validate(val, props.onChangeValidate)
                .then(() => setErrors([]))
                .catch((error: string | ZodError) => {
                if (error instanceof ZodError) {
                    setErrors(error.errors.map(error => error.message));
                } else {
                    setErrors([error]);
                }
            });
        }
    }

    const mutableRef = useRef<FieldProps<T>>({value, props, setErrors, errors});

    useLayoutEffect(() => {
        mutableRef.current.props = props;
        const newMutable = mutableRef.current;
        formFieldsRef.current.push(newMutable);

        return () => {
            formFieldsRef.current.slice(formFieldsRef.current.indexOf(newMutable), 1);
        }
    }, [props]);

    useLayoutEffect(() => {
        mutableRef.current.value = value;
    }, [value]);

    useLayoutEffect(() => {
        mutableRef.current.errors = errors;
    }, [errors]);

    return props.children({value, onChange, errors})
}

interface SubmitFieldProps {
    children: (props: {
        onSubmit: () => void
    }) => JSX.Element;
}

export function SubmitField(props: SubmitFieldProps) {
    const {onSubmit} = useContext(FormContext);

    // TODO: Pass `isValid`, pass `isTouched`, pass `isDirty`

    return props.children({onSubmit});
}
