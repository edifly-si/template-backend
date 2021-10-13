openssl genrsa -out ./key/private.pem 512
openssl rsa -in ./key/private.pem -out ./key/public.pem -outform PEM -pubout