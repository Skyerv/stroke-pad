export class HskService {
  constructor(electronApiService) {
    this.electronApiService = electronApiService;
    this.lessonDataPromise = null;
  }

  async loadLessonData() {
    if (!this.lessonDataPromise) {
      this.lessonDataPromise = this.electronApiService.loadHskLessonData();
    }

    return this.lessonDataPromise;
  }
}
