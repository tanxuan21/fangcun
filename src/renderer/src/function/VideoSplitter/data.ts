// 数据存储区

export interface SegmentInterface {
  begin: number
  end: number
  sub_segment: SegmentInterface[]
}

const segment: SegmentInterface = {
  begin: 1,
  end: 10,
  sub_segment: []
}
