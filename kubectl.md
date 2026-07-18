এখানে একটি Nginx Deployment তৈরি করা, সেটি পরীক্ষা করা, আপডেট করা এবং সম্পূর্ণভাবে মুছে ফেলার জন্য প্রয়োজনীয় সবকটি kubectl কমান্ড ধাপে ধাপে দেওয়া হলো:
## ১. ডেপ্লয়মেন্ট তৈরি করা (Creation)

* সরাসরি কমান্ড দিয়ে তৈরি করতে:

kubectl create deployment nginx-deploy --image=nginx --replicas=3

* YAML ফাইল থেকে তৈরি করতে:

kubectl apply -f nginx-deployment.yaml


## ২. অবস্থা পরীক্ষা করা (Verification)

* ডেপ্লয়মেন্টের স্থিতি দেখতে:

kubectl get deployments

* চলমান পড (Pods) গুলোর তালিকা দেখতে:

kubectl get pods -l app=nginx

* পডগুলোর আইপি (IP) এবং নোডের নামসহ বিস্তারিত দেখতে:

kubectl get pods -o wide

* ডেপ্লয়মেন্টের বিস্তারিত ইতিহাস ও লগ দেখতে:

kubectl describe deployment nginx-deploy


## ৩. নেটওয়ার্ক ও ট্রাফিক চালু করা (Exposing Traffic)

* ক্লাউড প্রোভাইডারের জন্য (Public IP তৈরি করতে):

kubectl expose deployment nginx-deploy --port=80 --type=LoadBalancer --name=nginx-svc

* লোকাল ক্লাস্টার বা ইন্টারনাল টেস্টের জন্য:

kubectl expose deployment nginx-deploy --port=80 --type=NodePort --name=nginx-svc

* তৈরি হওয়া সার্ভিসের আইপি ও পোর্ট দেখতে:

kubectl get service nginx-svc


## ৪. স্কেলিং ও আপডেট করা (Scaling & Updates)

* পডের সংখ্যা বাড়িয়ে ৫টি করতে:

kubectl scale deployment nginx-deploy --replicas=5

* Nginx-এর ভার্সন আপডেট করতে (যেমন: ভার্সন ১.২৭):

kubectl set image deployment/nginx-deploy nginx=nginx:1.27

* আপডেটের স্ট্যাটাস বা অগ্রগতি দেখতে:

kubectl rollout status deployment/nginx-deploy

* আপডেটে কোনো ভুল হলে আগের অবস্থায় (Rollback) ফিরে যেতে:

kubectl rollout undo deployment/nginx-deploy

[1] 

## ৫. ট্রাবলশুটিং ও ডিবাগিং (Troubleshooting)

* যেকোনো একটি পডের লাইভ লগ দেখতে:

kubectl logs -f <pod-name>

* যেকোনো একটি পডের ভেতরে প্রবেশ করতে (Interactive Terminal):

kubectl exec -it <pod-name> -- /bin/bash

* কোনো সার্ভিস ছাড়াই সাময়িকভাবে লোকালহোস্টে পোর্ট ফরওয়ার্ড করতে:

kubectl port-forward deployment/nginx-deploy 8080:80

[2] 

## ৬. সবকিছু মুছে ফেলা (Cleanup)

* তৈরি করা সার্ভিসটি মুছতে:

kubectl delete service nginx-svc

* সম্পূর্ণ Nginx ডেপ্লয়মেন্টটি মুছে ফেলতে:

kubectl delete deployment nginx-deploy


পরবর্তী পদক্ষেপ হিসেবে আপনি কি কাস্টম কনফিগারেশন (ConfigMap) যুক্ত করতে চান, নাকি ইনগ্রেস (Ingress) সেটআপ করতে চান তা আমাকে জানাতে পারেন।

[1] [https://medium.com](https://medium.com/@mehar.chand.cloud/a-beginners-guide-to-essential-kubernetes-commands-2ba02765f8d6)
[2] [https://dzone.com](https://dzone.com/articles/guide-to-useful-kubectl-commands)
