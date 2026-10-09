import { z } from "zod";
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const p = v.replace(/[\s()-]/g, "");
      return /^[6-9]\d{9}$/.test(p) || /^\+[1-9]\d{7,14}$/.test(p);
    }, "Enter a valid mobile number, or include an international country code."),
  email: z
    .union([
      z.literal(""),
      z.string().email("Please enter a valid email address."),
    ])
    .optional(),
  message: z
    .string()
    .max(3000, "Please keep your message under 3,000 characters.")
    .optional(),
  contactTime: z.string().max(100).optional(),
  type: z.enum([
    "Buy Property",
    "Sell Property",
    "Property Consultation",
    "Investment Enquiry",
    "General Enquiry",
    "Schedule a Visit",
    "Request Details",
  ]),
  category: z.string().trim().min(1).max(30),
  consent: z.boolean().refine((v) => v, "Please agree to being contacted."),
  website: z.string().max(200).optional(),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
