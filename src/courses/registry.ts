import type { ComponentType } from 'react'
import type { CourseId } from '../router'
import AppointmentCourse, { appointmentMeta } from './appointment/course'
import InsuranceCourse, { insuranceMeta } from './insurance/course'
import PaymentCourse, { paymentMeta } from './payment/course'
import TransitCourse, { transitMeta } from './transit/course'
import type { CourseMeta } from './types'

/** 新增一课只要在这里登记：学习中心、练习页和手机壳标题都从这里取。 */
export const COURSE_META: Record<CourseId, CourseMeta> = {
  appointment: appointmentMeta,
  payment: paymentMeta,
  transit: transitMeta,
  insurance: insuranceMeta,
}

export const COURSE_ORDER: CourseId[] = ['appointment', 'payment', 'transit', 'insurance']

export const COURSE_SCREENS: Record<CourseId, ComponentType> = {
  appointment: AppointmentCourse,
  payment: PaymentCourse,
  transit: TransitCourse,
  insurance: InsuranceCourse,
}
