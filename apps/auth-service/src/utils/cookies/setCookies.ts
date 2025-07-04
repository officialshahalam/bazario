import { Response } from "express";


export const setCookie = (name: string, value: string,res: Response) => {
   res.cookie(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
   })
}