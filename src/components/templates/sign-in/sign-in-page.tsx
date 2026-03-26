import { SignInForm } from "./components/sign-in-form";
import { SignInImage } from "./components/sign-in-image";

export const SignIn = () => {
  return (
    <div className="flex min-h-screen lg:flex">
      <div className="w-full items-center justify-center hidden lg:flex lg:bg-[linear-gradient(-45deg,_#001f54,_#7fdbff,_#ff0080,_#001f54)] bg-[size:400%_400%]">
        <SignInImage className="max-h-[80%] object-contain" />
      </div>

      <div className="w-full lg:w-2/3 bg-[linear-gradient(-45deg,_#001f54,_#7fdbff,_#ff0080,_#001f54)] bg-[size:400%_400%] lg:bg-[linear-gradient(-60deg,#ffffff)] flex flex-col items-center justify-center p-8">
        <SignInImage className="lg:hidden mb-24"/>

        <SignInForm />
      </div>
    </div>
  );
}
